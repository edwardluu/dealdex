import {ethers, BigNumber, Signer, providers } from 'ethers';
import {BigNumber as BigNumberJS} from "bignumber.js"
import User from '../DataModels/User';
import {Deal} from '../DataModels/DealData'
import {DealConfig, DealParticipantAddresses, DealExchangeRate, InvestConfig, RefundConfig, TokensConfig, FundsConfig} from '../DataModels/DealConfig'
import SmartContractService from "./SmartContractService"


import DatabaseService from './DatabaseService';
import DealMetadata from '../DataModels/DealMetadata';


export default class DealService {

    static async initWithFirebase(dealData: Deal) {
        let dealMetadata = await DatabaseService.getDealMetadata(dealData.dealAddress!)
        dealData.name = dealMetadata?.name

        if (dealData.startup.address) {
            let project = await DatabaseService.getUser(dealData.startup.address)
            dealData.startup.name = project?.name || ""
        }

        for (let [idx, investor] of dealData.investors.entries()) {
            if (investor.address) {
                let investorInfo = await DatabaseService.getUser(investor.address)
                dealData.investors[idx].name = investorInfo?.name || ""
            }
        }
    }

    static async publishDeal(dealData: Deal, user: User) { 
        let signer = await SmartContractService.getSignerForUser(user)       
        const creatorAddress = await signer!.getAddress()
        const startupAddress = dealData.startup.address
        

        const minWeiPerInvestor = ethers.utils.parseEther(dealData.minInvestmentPerInvestor!.toString())
        const maxWeiPerInvestor = ethers.utils.parseEther(dealData.maxInvestmentPerInvestor!.toString()) 

        const minTotalWei = ethers.utils.parseEther(dealData.minTotalInvestment!.toString())
        const maxTotalWei = ethers.utils.parseEther(dealData.maxTotalInvestment!.toString()) 

        const deadlineUnixTimestamp = Math.round( 
            dealData.vestDate!.getTime() / 1000
        )
        const deadline = BigNumber.from(deadlineUnixTimestamp.toString())

        const gateToken = dealData.gateToken

        let dealParticipantAddresses = new DealParticipantAddresses(creatorAddress, startupAddress)
        let exchangeRateConfig = await getTickDetailsConfig(dealData, user)
        let investConfig = new InvestConfig(minWeiPerInvestor, maxWeiPerInvestor, minTotalWei, maxTotalWei, gateToken, deadline)
        let refundConfig = new RefundConfig()
        let tokensConfig = new TokensConfig(dealData.startupTokenAddress)
        let fundsConfig = new FundsConfig()

        let dealConfig = new DealConfig(
            dealParticipantAddresses,
            exchangeRateConfig,
            investConfig,
            refundConfig,
            tokensConfig,
            fundsConfig 
        )

        const dealFactoryAddress = await DatabaseService.getDealFactoryAddress()

        if (dealFactoryAddress === undefined) {
            console.log("Error: unable to find deal factory")
            return
        }

        let txn = await SmartContractService.createDeal(dealFactoryAddress!, signer!, dealConfig)
        if (txn.error == null) {
            await DatabaseService.recordPendingDeal(
                dealConfig,
                new DealMetadata(dealData.name!),
                txn.hash
            )
        }
        return txn;
    } 

    static async fetchDeal(provider: providers.Provider, dealAddress: string) {
        const config = await SmartContractService.fetchDealConfig(dealAddress, provider)
        console.log("Deal config:", config)
        const startupAddress = config.participantAddresses.startup

        // [ [investors], [amounts] ]
        const investment = await SmartContractService.fetchSubscribedInvestors(dealAddress, provider)
        const investorAddresses = investment[0]
        const investorAmounts = investment[1]
        console.log(investorAddresses)

        // All numbers are of type BigNumber
        const tickSize = config.tickDetails.tickSize
        const tickValue = config.tickDetails.tickValue

        const startupTokenAddress = config.tokensConfig.startupTokenAddress

        const gateToken = config.investConfig.gateToken

        const ethPerToken = await getEthPerTokenInContract(startupTokenAddress, tickSize, tickValue, provider)
        const tokensInContract = await getTokensInContract(
            startupTokenAddress,
            dealAddress,
            provider
        )

        const weiInContract = await SmartContractService.getWeiBalance(dealAddress, provider)
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

        const deal = new Deal(
            User.empty(startupAddress),
            investorAddresses.map(function(investorAddress: string, index: Number){
                return User.empty(investorAddress)
            }),
            investorAmounts,
            "" /* name */,
            dealAddress,
            ethPerToken,
            getValidatedAddress(startupTokenAddress),
            minInvestmentPerInvestor,
            maxInvestmentPerInvestor,
            minTotalInvestment,
            maxTotalInvestment,
            investmentDeadline,
            tokensInContract,
            ethInContract,
            getValidatedAddress(gateToken)
        )

        await DealService.initWithFirebase(deal)
        return deal
    }

    static async fetchAllDeals(): Promise<DealMetadata[]> {
        return await DatabaseService.getAllDealsMetadata()
    }

    static async invest(signer: Signer, dealData: Deal, ethToInvest: string) {
        const weiToInvest = ethers.utils.parseEther(ethToInvest.toString())
        console.log(weiToInvest.toString())
        const minWeiAmount = ethers.utils.parseEther(dealData.minInvestmentPerInvestor!)
        const maxWeiAmount = ethers.utils.parseEther(dealData.maxInvestmentPerInvestor!)

        let txn = await SmartContractService.invest(dealData.dealAddress!, signer, weiToInvest)
        if (txn.error == null) {
            const address = await signer.getAddress();
            await DatabaseService.recordInvestment(address, dealData.dealAddress!)
        }
        return txn;
    }

    static async sendTokens(signer: Signer, dealData: Deal, amount: string) {
        return await SmartContractService.sendERC20Tokens(dealData.startupTokenAddress!, dealData.dealAddress!, signer, amount)
    }

    static async claimFunds(signer: Signer, dealData: Deal) {
        return await SmartContractService.claimFunds(dealData.dealAddress!, signer)
    }

    static async claimRefund(signer: Signer, dealData: Deal) {
        return await SmartContractService.claimRefund(dealData.dealAddress!, signer)
    }

    static async claimTokens(signer: Signer, dealData: Deal) {
        return await SmartContractService.claimTokens(dealData.dealAddress!, signer)
    }

    static async updateStartupToken(user: User, 
                                    dealData: Deal, 
                                    newStartupTokenAddress: string, 
                                    newStartupTokenPrice: string) {
        const newDeal = Deal.empty()
        newDeal.ethPerToken = newStartupTokenPrice
        newDeal.startupTokenAddress = newStartupTokenAddress
        const exchangeRate = await getTickDetailsConfig(newDeal, user)

        const signer = await SmartContractService.getSignerForUser(user)
        return await SmartContractService.updateProjectToken(dealData.dealAddress!, newStartupTokenAddress, exchangeRate, signer!)
    }
}

// MARK: - Helpers

function getValidatedAddress(address: string): string | undefined {
    if (address === ethers.constants.AddressZero) {
        return undefined
    }
    return address
}

async function getTokensInContract(startupTokenAddress: string,
                                   contractAddress: string,
                                   provider: ethers.providers.Provider): Promise<string | undefined> {

    const decimals = await SmartContractService.getERC20Decimals(startupTokenAddress, provider)

    if (decimals === undefined) {
        return undefined
    }

    const tokenBitsInContract = await SmartContractService.getERC20Balance(startupTokenAddress, contractAddress, provider)

    if (tokenBitsInContract === undefined) {
        return undefined
    }
    const tokensInContract = ethers.utils.formatUnits(tokenBitsInContract, decimals)
    return tokensInContract
}

async function getEthPerTokenInContract(startupTokenAddress: string,
                                        tickSize: BigNumber,
                                        tickValue: BigNumber, 
                                        provider: ethers.providers.Provider): Promise<string | undefined> {
    if (startupTokenAddress === ethers.constants.AddressZero) {
        return undefined
    }

    const decimals = await SmartContractService.getERC20Decimals(startupTokenAddress, provider)
    if (decimals === undefined) {
        return undefined
    }

    const ethPerToken = getEthPerToken(tickSize, tickValue, decimals)

    return ethPerToken
}

function isInvalidAddress(address: any) {
    return address === undefined || address === ""
}


// tickSize is in wei. tickValue is in tokenBits.
async function getTickDetailsConfig(dealData: Deal, user: User): Promise<DealExchangeRate> {
    let startupTokenAddress = dealData.startupTokenAddress

    if (isInvalidAddress(dealData.startupTokenAddress)) {
        return DealExchangeRate.undefined()
    }

    if (dealData.ethPerToken === undefined) {
        return DealExchangeRate.undefined()
    }

    let signer = await SmartContractService.getSignerForUser(user)
    const decimals = await SmartContractService.getERC20Decimals(startupTokenAddress!, signer!)

    if (decimals === undefined) {
        return DealExchangeRate.undefined()
    }
    let result = new DealExchangeRate(dealData.ethPerToken, decimals)
    return result
}


function getEthPerToken(tickSize: BigNumber, tickValue: BigNumber, tokenDecimals: number): string {
    const bigTickSize = new BigNumberJS(tickSize.toString())
    const bigTickValue = new BigNumberJS(tickValue.toString())
    const weiPerTokenBits = bigTickSize.dividedBy(bigTickValue)

    const multiplier = (new BigNumberJS(10)).exponentiatedBy(tokenDecimals - 18)

    const ethPerToken = weiPerTokenBits.multipliedBy(multiplier)
    return ethPerToken.toString()
}
