
// TODO: figure out how to get this import statement working so we can actually have types. Need to update some config or some shit
//import { ContractFactory, Contract, BigNumber } from "ethers";

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const BigNumberJS = require("bignumber.js");

/*
let Deal = await ethers.getContractFactory("Deal");
let DealFactory = await ethers.getContractFactory("DealFactory");
let SimpleToken = await ethers.getContractFactory("SimpleToken");
*/


async function validateDeal(deal, // Contract, 
                            expectedEthBalance, // BigNumber, 
                            expectedStartupTokenBalance, // BigNumber, 
                            startupToken, // Contract, 
                            tickSize, // BigNumber,
                            tickValue, // BigNumber
                            minInvestment, // BigNumber, 
                            maxInvestment, // BigNumber,
                            startup, //: string,
                            investors, //: string[],
                            expiryDate //: Number
                            ) {
    const prov = ethers.getDefaultProvider();
    
    const decimals = await startupToken.decimals()

    const expectedWeiBalance = ethers.utils.parseEther(expectedEthBalance.toString())
    const expectedStartupTokenBitBalance = ethers.utils.parseUnits(expectedStartupTokenBalance.toString(), decimals)
    expect(await deal.expiryDate()).to.equal(expiryDate);
    expect(await deal.provider.getBalance(deal.address)).to.equal(expectedWeiBalance);
    expect(await startupToken.balanceOf(deal.address)).to.equal(expectedStartupTokenBitBalance);
    expect(await deal.startupToken()).to.equal(startupToken.address);
    const investorsInContract = await deal.getInvestors()
    const investorAddressesInContract = investorsInContract[0]
    expect(investorAddressesInContract.length).to.equal(investors.length);
    
    for (let i = 0; i < investors.length; i++) {
        expect(investorAddressesInContract[i]).to.equal(investors[i]);
    }
    expect(await deal.startup()).to.equal(startup);
}

async function createDeal(dealFactory, //: Contract, 
                            startupToken, //: Contract, 
                            tickSize, //: BigNumber, 
                            tickValue, //: BigNumber
                            minInvestment, //: BigNumber,
                            maxInvestment, //: BigNumber,
                            startupAddress, //: string,
                            expiryDate //: Number
                            ) {
    let Deal = await ethers.getContractFactory("Deal")

    const minWeiAmount = ethers.utils.parseEther(minInvestment.toString())
    const maxWeiAmount = ethers.utils.parseEther(maxInvestment.toString()) 

    const transaction = await dealFactory.createDeal(
        tickSize,
        tickValue,
        startupToken.address, 
        startupAddress, 
        minWeiAmount, 
        maxWeiAmount, 
        expiryDate
    )

    const receipt = await transaction.wait()
    for (let eventData of receipt.events) {
        if (eventData.event == "DealCreated") {
            console.log(eventData.args[0])
            let newDeal = await Deal.attach(eventData.args[0]);
            return newDeal
        }
    }

    // let numDeals = await dealFactory.getNumDeals();
    // let newDealAddress = await dealFactory.deals(numDeals - 1);
    // let newDeal = await Deal.attach(newDealAddress);

    // return newDeal;
}

async function createAndValidateDeal(dealFactory, //: Contract, 
                                        startupToken, //: Contract, 
                                        tickSize, //: BigNumber, 
                                        tickValue, //: BigNumber,
                                        minInvestment, //: BigNumber,
                                        maxInvestment, //: BigNumber,
                                        startupAddress, //: string,
                                        expiryDate //: Number
                                        ) {
    let newDeal = await createDeal(
        dealFactory, 
        startupToken, 
        tickSize, 
        tickValue,
        minInvestment,
        maxInvestment,
        startupAddress,
        expiryDate
    )
    
    await validateDeal(
        newDeal, 
        BigNumber.from("0"),
        BigNumber.from("0"),
        startupToken,
        tickValue,
        tickValue,
        minInvestment,
        maxInvestment,
        startupAddress,
        [],
        expiryDate
    )
}

async function sendTokens(deal, //: Contract,
                            startup, //: Signer,
                            startupToken, //: Contract,
                            amount // :BigNumber
                            ) {
    const decimals = await startupToken.decimals()
    const finalAmount = amount.mul(BigNumber.from("10").pow(decimals))
    await startupToken.connect(startup).transfer(deal.address, finalAmount)
}

async function claimProceeds(deal, //: Contract,
                                startup //: Signer
                                ) {
    await deal.connect(startup).claimProceeds()
}
async function invest(deal, //: Contract,
                        investor, //: Signer, 
                        ethToInvest //: BigNumber
                        ) {
    const weiToInvest = ethers.utils.parseEther(ethToInvest.toString()) 
    let overrides = {
        value: weiToInvest 
    };                  
    await deal.connect(investor).invest(overrides)
}

module.exports = {
    validateDeal: validateDeal,
    createDeal: createDeal,
    createAndValidateDeal: createAndValidateDeal,
    sendTokens: sendTokens,
    claimProceeds: claimProceeds,
    invest: invest
};
