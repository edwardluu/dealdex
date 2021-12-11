import {ethers, BigNumber, Signer, providers } from 'ethers';
import {BigNumber as BigNumberJS} from "bignumber.js"
import User from './User';

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


export default class DealData {
    name?: string
    dealAddress?: string
    startup: User
    investors: User[]
    investorAmounts: string[]
    ethPerToken?: string
    startupTokenAddress?: string
    minInvestmentPerInvestor?: string
    maxInvestmentPerInvestor?: string
    minTotalInvestment?: string
    maxTotalInvestment?: string
    investmentDeadline?: Date
    tokensInContract?: string
    ethInContract?: string
    gateToken?: string

    constructor(startup: User, 
                investors: User[], 
                investorAmounts: string[],
                name?: string, 
                dealAddress?: string,
                ethPerToken?: string,
                startupTokenAddress?: string, 
                minInvestmentPerInvestor?: string,
                maxInvestmentPerInvestor?: string,
                minTotalInvestment?: string,
                maxTotalInvestment?: string,
                investmentDeadline?: Date,
                tokensInContract?: string,
                ethInContract?: string,
                gateToken?: string) {
        this.name = name
        this.dealAddress = dealAddress
        this.startup = startup
        this.investors = investors
        this.investorAmounts = investorAmounts
        this.ethPerToken = ethPerToken
        this.startupTokenAddress = startupTokenAddress
        this.minInvestmentPerInvestor = minInvestmentPerInvestor
        this.maxInvestmentPerInvestor = maxInvestmentPerInvestor
        this.minTotalInvestment = minTotalInvestment
        this.maxTotalInvestment = maxTotalInvestment
        this.investmentDeadline = investmentDeadline
        this.tokensInContract = tokensInContract
        this.ethInContract = ethInContract
        this.gateToken = gateToken
    }

    static empty(user?: User) {
        if (user !== undefined) {
            return new DealData(user, [], [])
        } else {
            return new DealData(User.empty(), [], [])
        }
    }

}
