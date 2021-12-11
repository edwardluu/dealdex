import {ethers, BigNumber, Signer, providers } from 'ethers';
import {BigNumber as BigNumberJS} from "bignumber.js"
import User from '../DataModels/User';
import DealData from '../DataModels/DealData'

// artifacts directory is generated when you run 
// npx hardhat compile
// in the commandline
// compile target directory is defined in hardhat.config.js
import DealFactory from '../artifacts/contracts/PogDeal.sol/DealFactory.json'
import Deal from '../artifacts/contracts/PogDeal.sol/Deal.json'
import ERC20_ABI from "../ContractABIs/ERC20.json"


import DeploymentState from "../artifacts/deployment-info/DeploymentState.json"
import { getUserDoc } from '../firebaseUtils';
const { getFirebaseDoc, fbCreateDeal, fbCreatePendingDeal, getDealDoc, fbInvest, getAllDealDocs } = require("../firebaseUtils.js");


export default class DealService {
    static async initWithFirebase(dealData: DealData) {
        let dealDoc = await getDealDoc(DeploymentState.firebaseCollection, dealData.dealAddress!)
        dealData.name = dealDoc.name
        if (dealData.startup.address) {
            let startupDoc = await getUserDoc(DeploymentState.firebaseCollection, dealData.startup.address)
            if (startupDoc !== null) {
                dealData.startup.name = startupDoc.name
            }
        }

        for (let [idx, investor] of dealData.investors.entries()) {
            if (investor.address) {
                let investorDoc = await getUserDoc(DeploymentState.firebaseCollection, investor.address)
                if (investorDoc !== null) {
                    dealData.investors[idx].name = investorDoc.name
                }
            }
        }
    }

    static async publishDeal(dealData: DealData, user: User) {

        const metadata = await getFirebaseDoc(DeploymentState.firebaseCollection, "metadata")

        const contract = new ethers.Contract(metadata.dealFactory_addr, DealFactory.abi, user.signer!)
        
        const creatorAddress = await user.signer!.getAddress()
        const startupAddress = dealData.startup.address
        

        const minWeiPerInvestor = ethers.utils.parseEther(dealData.minInvestmentPerInvestor!.toString())
        const maxWeiPerInvestor = ethers.utils.parseEther(dealData.maxInvestmentPerInvestor!.toString()) 

        const minTotalWei = ethers.utils.parseEther(dealData.minTotalInvestment!.toString())
        const maxTotalWei = ethers.utils.parseEther(dealData.maxTotalInvestment!.toString()) 

        const deadlineUnixTimestamp = Math.round( 
            dealData.investmentDeadline!.getTime() / 1000
        )
        const deadline = BigNumber.from(deadlineUnixTimestamp.toString())

        const gateToken = getGateTokensConfig(dealData, user)
        const participantAddresses = [creatorAddress, startupAddress];
        const tickDetails = await getTickDetailsConfig(dealData, user)
        const _investmentSizeConstraints = [minWeiPerInvestor, maxWeiPerInvestor, minTotalWei, maxTotalWei];
        const investConfig = [_investmentSizeConstraints, /* lockConstraint = NO_CONSTRAINT */ 0, /* gateToken */ gateToken, deadline];
        const refundConfig = [/* allowRefunds */ true, /* lockConstraint = REQUIRE_UNLOCKED */ 2];
        const tokensConfig = getTokensConfig(dealData, user)
        const fundsConfig = [/* feeBps */ 0, /* lockConstraint = REQUIRE_LOCKED */ 1];
        
        const dealConfig = [participantAddresses, tickDetails, investConfig, refundConfig, tokensConfig, fundsConfig];

        // If you get this error:
        // "Unhandled Rejection (Error): invalid ENS name (argument="name", value=0, code=INVALID_ARGUMENT, version=providers/5.4.4)"
        // it means something in the argument is malformatted e.g. gateToken is 0 instead of ethers.constants.AddressZero :/
        const transaction = await contract.createDeal(dealConfig)

        const transactionHash = transaction.hash
        const creatorIsStartup = (creatorAddress == startupAddress)
        await fbCreatePendingDeal(DeploymentState.firebaseCollection, creatorAddress, startupAddress, transactionHash, dealData.name!)
    } 

    static async fetchDeal(provider: providers.Provider, dealAddress: string) {
        const contract = new ethers.Contract(dealAddress, Deal.abi, provider)

        try {
            const config = await contract.config()
            console.log("Deal config:", config)
            const startupAddress = config.participantAddresses.startup

            // [ [investors], [amounts] ]
            const investment = await contract.getInvestors()
            const investorAddresses = investment[0]
            const investorAmounts = investment[1]
            console.log(investorAddresses)

            // All numbers are of type BigNumber
            const tickSize = config.tickDetails.tickSize
            const tickValue = config.tickDetails.tickValue

            const startupTokenAddress = config.tokensConfig.startupTokenAddress

            const gateToken = config.investConfig.gateToken

            const ethPerToken = await getEthPerTokenInContract(startupTokenAddress, tickSize, tickValue, provider)
            
            const tokensInContract = await getTokensInContract(startupTokenAddress, contract.address, provider)
            const weiInContract = await provider.getBalance(contract.address)
            const ethInContract = ethers.utils.formatEther(weiInContract)

            var minInvestmentPerInvestor = config.investConfig.sizeConstraints.minInvestmentPerInvestor
            minInvestmentPerInvestor = ethers.utils.formatEther(minInvestmentPerInvestor)
            var maxInvestmentPerInvestor = config.investConfig.sizeConstraints.maxInvestmentPerInvestor
            maxInvestmentPerInvestor = ethers.utils.formatEther(maxInvestmentPerInvestor)

            var minTotalInvestment = config.investConfig.sizeConstraints.minTotalInvestment
            minTotalInvestment = ethers.utils.formatEther(minTotalInvestment)
            var maxTotalInvestment = config.investConfig.sizeConstraints.maxTotalInvestment
            maxTotalInvestment = ethers.utils.formatEther(maxTotalInvestment)

            var investmentDeadline = config.investConfig.investmentDeadline
            investmentDeadline = new Date(investmentDeadline.toNumber() * 1000) // Seconds -> Milliseconds

            const deal = new DealData(
                new User(startupAddress),
                investorAddresses.map(function(investorAddress: string, index: Number){
                    return new User(investorAddress)
                }),
                investorAmounts,
                "",
                dealAddress,
                ethPerToken,
                startupTokenAddressToDisplay(startupTokenAddress),
                minInvestmentPerInvestor,
                maxInvestmentPerInvestor,
                minTotalInvestment,
                maxTotalInvestment,
                investmentDeadline,
                tokensInContract,
                ethInContract,
                gateTokenToDisplay(gateToken)
            )

            await DealService.initWithFirebase(deal)
            return deal
        } catch (err) {
            console.log("Error: ", err)
        }
    }

    static async fetchAllDeals() {
        const dealDocs = await getAllDealDocs(DeploymentState.firebaseCollection)
        return dealDocs.map( (dealDoc: any) => {
            let dealData = DealData.empty()
            dealData.dealAddress = dealDoc.id.substring(5)
            dealData.name = dealDoc.data().name
            return dealData
        })
    }

    static async invest(signer: Signer, dealData: DealData, ethToInvest: string) {
        const weiToInvest = ethers.utils.parseEther(ethToInvest.toString())
        console.log(weiToInvest.toString())
        const minWeiAmount = ethers.utils.parseEther(dealData.minInvestmentPerInvestor!)
        const maxWeiAmount = ethers.utils.parseEther(dealData.maxInvestmentPerInvestor!)
        if (weiToInvest.lt(minWeiAmount)) {
            console.log("Investment amount is too low")
            return
        }
        if (weiToInvest.gt(maxWeiAmount)) {
            console.log("Investment amount is too high")
            return
        }

        const contract = new ethers.Contract(dealData.dealAddress!, Deal.abi, signer)
          

        let overrides = {
            value: weiToInvest 
        };
        
        // Pass in the overrides
        let tx = await contract.invest(overrides)
        const receipt = await tx.wait()
        const address = await signer.getAddress()
        await fbInvest(DeploymentState.firebaseCollection, address, dealData.dealAddress!)

        return receipt
    }

    static async sendTokens(signer: Signer, dealData: DealData, amount: string) {
        const tokenContract = new ethers.Contract(dealData.startupTokenAddress!, ERC20_ABI, signer)
        const bigAmount = ethers.BigNumber.from(amount.toString())
        console.log(bigAmount)
        const decimals = await tokenContract.decimals()
        const finalAmount = bigAmount.mul(BigNumber.from("10").pow(decimals))
        console.log(finalAmount)
        await tokenContract.transfer(dealData.dealAddress, finalAmount)
    }

    static async claimFunds(signer: Signer, dealData: DealData) {
        const contract = new ethers.Contract(dealData.dealAddress!, Deal.abi, signer)
        contract.claimFunds()
    }

    static async claimTokens(signer: Signer, dealData: DealData) {
        const contract = new ethers.Contract(dealData.dealAddress!, Deal.abi, signer)
        contract.claimTokens()
    }

    static async updateStartupToken(user: User, 
                                    dealData: DealData, 
                                    newStartupTokenAddress: string, 
                                    newStartupTokenPrice: string) {
        const contract = new ethers.Contract(dealData.dealAddress!, Deal.abi, user.signer!)

        const newDeal = DealData.empty()
        newDeal.ethPerToken = newStartupTokenPrice
        newDeal.startupTokenAddress = newStartupTokenAddress
        const tickDetails = await getTickDetailsConfig(newDeal, user)
        await contract.setStartupToken(newStartupTokenAddress, tickDetails)
    }
}

// MARK: - Helpers

function startupTokenAddressToDisplay(startupTokenAddress: string) {
    if (startupTokenAddress === ethers.constants.AddressZero) {
        return "N/A"
    }
    return startupTokenAddress
}

function gateTokenToDisplay(gateToken: string) {
    if (gateToken === ethers.constants.AddressZero) {
        return "N/A"
    }
    return gateToken
}

async function getTokensInContract(startupTokenAddress: string,
                                   contractAddress: string,
                                   provider: ethers.providers.Provider) {
    if (startupTokenAddress === ethers.constants.AddressZero) {
        return "N/A"
    }

    const tokenContract = new ethers.Contract(startupTokenAddress, ERC20_ABI, provider)
    const decimals = await tokenContract.decimals()
    const tokenBitsInContract = await tokenContract.balanceOf(contractAddress)
    const tokensInContract = ethers.utils.formatUnits(tokenBitsInContract, decimals)
    return tokensInContract
}

async function getEthPerTokenInContract(startupTokenAddress: string,
                                        tickSize: BigNumber,
                                        tickValue: BigNumber, 
                                        provider: ethers.providers.Provider): Promise<string> {
    if (startupTokenAddress === ethers.constants.AddressZero) {
        return "Not set"
    }

    const tokenContract = new ethers.Contract(startupTokenAddress, ERC20_ABI, provider)
    const decimals = await tokenContract.decimals()
    const ethPerToken = getEthPerToken(tickSize, tickValue, decimals)
    return ethPerToken
}

function getTokensConfig(dealData: DealData, user: User): [string, number] {
    if (dealData.startupTokenAddress === undefined || dealData.startupTokenAddress === '') {
        return [ethers.constants.AddressZero, /* lockConstraint = REQUIRE_LOCKED */ 1]
    }
    return [dealData.startupTokenAddress, /* lockConstraint = REQUIRE_LOCKED */ 1]
}

function getGateTokensConfig(dealData: DealData, user: User): string {
    if (dealData.gateToken === undefined || dealData.gateToken === '') {
        return ethers.constants.AddressZero
    }
    return dealData.gateToken
}

// tickSize is in wei. tickValue is in tokenBits.
async function getTickDetailsConfig(dealData: DealData, user: User): Promise<[BigNumber, BigNumber]> {
    if (dealData.startupTokenAddress === undefined || dealData.startupTokenAddress === '') {
        return [BigNumber.from("0"), BigNumber.from("0")]
    }

    if (dealData.ethPerToken === undefined) {
        return [BigNumber.from("0"), BigNumber.from("0")]
    }

    const tokenContract = new ethers.Contract(dealData.startupTokenAddress, ERC20_ABI, user.signer!)
    const decimals = await tokenContract.decimals()

    let [tickSize, tickValue] = getTickSizeAndValue(dealData.ethPerToken, decimals)
    return [tickSize, tickValue]
}

function getTickSizeAndValue(ethPerToken: string, tokenDecimals: number): [BigNumber, BigNumber] {
    const multiplier = (new BigNumberJS(10)).exponentiatedBy(18 - tokenDecimals)
    const bigEthPerToken = new BigNumberJS(ethPerToken)

    const weiPerTokenBits = bigEthPerToken.multipliedBy(multiplier)

    
    let [tickSize, tickValue] = weiPerTokenBits.toFraction()

    let bigTickSize = BigNumber.from(tickSize.toString())
    let bigTickValue =  BigNumber.from(tickValue.toString())

    return [bigTickSize, bigTickValue]
}

function getEthPerToken(tickSize: BigNumber, tickValue: BigNumber, tokenDecimals: number): string {
    const bigTickSize = new BigNumberJS(tickSize.toString())
    const bigTickValue = new BigNumberJS(tickValue.toString())
    const weiPerTokenBits = bigTickSize.dividedBy(bigTickValue)

    const multiplier = (new BigNumberJS(10)).exponentiatedBy(tokenDecimals - 18)

    const ethPerToken = weiPerTokenBits.multipliedBy(multiplier)
    return ethPerToken.toString()
}