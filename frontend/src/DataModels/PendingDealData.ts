import {ethers, Signer} from 'ethers';
import DeploymentState from "../artifacts/deployment-info/DeploymentState.json"
import {getUserDoc} from "../firebaseUtils"
import DealData from './DealData';


export default class PendingDealData {
    name: string
    startupAddress: string
    transactionHash: string

    constructor(name: string, startupAddress: string, transactionHash: string) {
        this.name = name
        this.startupAddress = startupAddress
        this.transactionHash = transactionHash
    }
}
