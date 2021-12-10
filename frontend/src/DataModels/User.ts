import {ethers, Signer} from 'ethers';
import DeploymentState from "../artifacts/deployment-info/DeploymentState.json"
import {getUserDoc, fbCreateDeal, fbDeletePendingDeal, getFirebaseDoc} from "../firebaseUtils"
import DealData from './DealData';
import PendingDealData from './PendingDealData';
import DealFactory from '../artifacts/contracts/PogDeal.sol/DealFactory.json'
import DealService from '../Services/DealService';

export default class User {
    address: string
    signer?: Signer
    name?: string

    constructor(address: string, signer?: Signer, name?: string) {
        this.address = address
        this.signer = signer
        this.name = name
    }

    async getUsername() {
        let doc = await getUserDoc(DeploymentState.firebaseCollection, this.address)
        if (doc !== null) {
            return doc.name
        } else {
            return ""
        }
    }

    async createIfNecessary() {
        await getUserDoc(DeploymentState.firebaseCollection, this.address)
    }

    async getDealsWhereStartup() {
        let result: DealData[] = []
        let doc = await getUserDoc(DeploymentState.firebaseCollection, this.address)
        if (doc !== null) {
            let addresses = doc.dealsWhereStartup
            for(var address of addresses) {
                let deal = DealData.empty()
                deal.dealAddress = address
                await DealService.initWithFirebase(deal)
                result.push(deal)
            }
        } 
        return result
    }

    async getPendingDealsWhereStartup() {
        let result: PendingDealData[] = []
        let doc = await getUserDoc(DeploymentState.firebaseCollection, this.address)
        if (doc !== null) {
            let pendingDeals = doc.pendingDealsWhereStartup
            console.log(pendingDeals)
            for(let transactionHash in pendingDeals) {
                let name = pendingDeals[transactionHash]['name']
                let startupAddress = pendingDeals[transactionHash]['startupAddress']
                let deal = new PendingDealData(name, startupAddress, transactionHash)
                result.push(deal)
                resolvePendingDeal(deal, this.address, true, name, this.signer!)
            }
        } 
        return result
    }

    async getDealsWhereInvestor() {
        let result: DealData[] = []
        let doc = await getUserDoc(DeploymentState.firebaseCollection, this.address)
        if (doc !== null) {
            let addresses = doc.dealsWhereInvestor
            for(var address of addresses) {
                let deal = DealData.empty()
                deal.dealAddress = address
                await DealService.initWithFirebase(deal)
                result.push(deal)
            }
        } 
        return result
    }

    async getPendingDealsWhereInvestor() {
        let result: PendingDealData[] = []
        let doc = await getUserDoc(DeploymentState.firebaseCollection, this.address)
        if (doc !== null) {
            let pendingDeals = doc.pendingDealsWhereInvestor
            console.log(pendingDeals)
            for(let transactionHash in pendingDeals) {
                let name = pendingDeals[transactionHash]['name']
                let startupAddress = pendingDeals[transactionHash]['startupAddress']
                let deal = new PendingDealData(name, startupAddress, transactionHash)
                result.push(deal)
                resolvePendingDeal(deal, this.address, false, name, this.signer!)
            }
        } 
        return result
    }

    isStartup(inDeal: DealData) {
        return (this.address == inDeal.startup.address) 
    }

    isInvestor(inDeal: DealData) {
        for (var investor of inDeal.investors) {
            if (this.address == investor.address) {
                return true
            }
        }
        return false
    }

    static empty() {
        return new User("")
    }
}

// Helpers

async function resolvePendingDeal(dealData: PendingDealData, creatorAddress: string, creatorIsStartup: boolean, dealName: string, signer: Signer) {

    let transactionHash = dealData.transactionHash
    let startupAddress = dealData.startupAddress
    let ethereum: any = (window as any).ethereum
    if (!ethereum) {
        console.log("No Ethereum wallet in browser")
        return
    }
    const provider = new ethers.providers.Web3Provider(ethereum)

    let receipt = await provider.getTransactionReceipt(transactionHash)
    if (!receipt) {
        return
    }
    console.log(receipt)
    const metadata = await getFirebaseDoc(DeploymentState.firebaseCollection, "metadata")
    console.log(metadata)
    const contract = new ethers.Contract(metadata!.dealFactory_addr, DealFactory.abi, signer)

    const filter = contract.filters.DealCreated(creatorAddress);
    const events = await contract.queryFilter(filter, receipt.blockHash)

    for (let eventData of events) {
        if (eventData.event == "DealCreated") {
            console.log(eventData.args)

            // index 0 is the address of the deal creator 
            let dealAddress = (eventData as any).args[1]
            let dealData = DealData.empty()
            dealData.dealAddress = dealAddress
            dealData.name = dealName
            await fbCreateDeal(DeploymentState.firebaseCollection, creatorAddress, startupAddress, dealAddress, {"name": dealData.name!})
            await fbDeletePendingDeal(
                DeploymentState.firebaseCollection,
                creatorAddress,
                transactionHash,
                creatorIsStartup
            )

            return
        }
    }

    // const receipt = await transaction.wait()
    // for (let eventData of receipt.events) {
    //     if (eventData.event == "DealCreated") {
    //         console.log(eventData.args)
    //         await fbCreateDeal(DeploymentState.firebaseCollection, validatedStartupAddress, eventData.args[0], {"name": dealData.name!})
    //     }
    // }
}