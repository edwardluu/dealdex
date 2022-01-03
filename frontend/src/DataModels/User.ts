import {ethers, Signer} from 'ethers';
import {Deal} from './DealData';
import PendingDealData from './PendingDealData';
import DealFactory from '../artifacts/contracts/PogDeal.sol/DealFactory.json'
import DealService from '../Services/DealService';
import DatabaseService from '../Services/DatabaseService'
import { DealParticipantAddresses } from './DealConfig';
import DealMetadata from './DealMetadata';
import SmartContractService from '../Services/SmartContractService';

export default class User {
    address: string
    name: string
    dealsWhereStartup: string[]
    dealsWhereInvestor: string[]
    pendingDealsWhereStartup: string[]
    pendingDealsWhereInvestor: string[]

    constructor(address: string, 
                name: string, 
                dealsWhereStartup: string[], 
                dealsWhereInvestor: string[], 
                pendingDealsWhereStartup: string[],
                pendingDealsWhereInvestor: string[]) {
        this.address = address
        this.name = name
        this.dealsWhereStartup = dealsWhereStartup
        this.dealsWhereInvestor = dealsWhereInvestor
        this.pendingDealsWhereStartup = pendingDealsWhereStartup
        this.pendingDealsWhereInvestor = pendingDealsWhereInvestor
    }

    async createIfNecessary() {
        await DatabaseService.getUser(this.address)
    }

    async getDealsWhereStartup() {
        let result: Deal[] = []
        let user = await DatabaseService.getUser(this.address)
        if (user !== undefined && user.dealsWhereStartup !== undefined) {
            let addresses = user.dealsWhereStartup
            for(var address of addresses) {
                let deal = Deal.empty()
                deal.dealAddress = address
                await DealService.initWithFirebase(deal)
                result.push(deal)
            }
        } 
        return result
    }

    async getPendingDealsWhereStartup() {
        let result: PendingDealData[] = []
        let user = await DatabaseService.getUser(this.address)
        if (user !== undefined && user.pendingDealsWhereStartup !== undefined) {
            let pendingDeals: any = user.pendingDealsWhereStartup
            for(let transactionHash in pendingDeals) {
                let name = pendingDeals[transactionHash]['name']
                let startupAddress = pendingDeals[transactionHash]['startupAddress']
                let deal = new PendingDealData(name, startupAddress, transactionHash)
                result.push(deal)
                resolvePendingDeal(deal, this.address, name)
            }
        } 
        return result
    }

    async getDealsWhereInvestor() {
        let result: Deal[] = []
        let user = await DatabaseService.getUser(this.address)
        if (user !== undefined && user.dealsWhereInvestor !== undefined) {
            let addresses = user.dealsWhereInvestor
            for(var address of addresses) {
                let deal = Deal.empty()
                deal.dealAddress = address
                await DealService.initWithFirebase(deal)
                result.push(deal)
            }
        } 
        return result
    }

    async getPendingDealsWhereInvestor() {
        let result: PendingDealData[] = []
        let user = await DatabaseService.getUser(this.address)
        if (user !== undefined && user.pendingDealsWhereInvestor !== undefined) {
            let pendingDeals: any = user.pendingDealsWhereInvestor
            for(let transactionHash in pendingDeals) {
                let name = pendingDeals[transactionHash]['name']
                let startupAddress = pendingDeals[transactionHash]['startupAddress']
                let deal = new PendingDealData(name, startupAddress, transactionHash)
                result.push(deal)
                resolvePendingDeal(deal, this.address, name)
            }
        } 
        return result
    }

    isStartup(inDeal: Deal) {
        console.log(this.address)
        console.log(inDeal.startup.address)
        return (this.address == inDeal.startup.address) 
    }

    isInvestor(inDeal: Deal) {
        for (var investor of inDeal.investors) {
            if (this.address == investor.address) {
                return true
            }
        }
        return false
    }

    static empty(address?: string) {
        if (address === undefined ) {
            return new User("", "", [], [], [], [])
        } else {
            return new User(address, "", [], [], [], [])
        }
    }
}

// Helpers

async function resolvePendingDeal(dealData: PendingDealData, creatorAddress: string, dealName: string) {

    let transactionHash = dealData.transactionHash
    let startupAddress = dealData.startupAddress
    let ethereum: any = (window as any).ethereum
    if (!ethereum) {
        console.log("No Ethereum wallet in browser")
        return
    }
    const provider = new ethers.providers.Web3Provider(ethereum)

    let dealAddress = await SmartContractService.getDealAddressFromTransactionHash(transactionHash, creatorAddress, provider)
        
    if (dealAddress === undefined) {
        return
    } else {
        let dealParticipants = new DealParticipantAddresses(creatorAddress, startupAddress)
        await DatabaseService.recordDeal(
            new DealParticipantAddresses(creatorAddress, startupAddress),
            new DealMetadata(dealName, dealAddress)
        )

        await DatabaseService.removePendingDealRecord(
            dealParticipants,
            transactionHash
        )
    }
}