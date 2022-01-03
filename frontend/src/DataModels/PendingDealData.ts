

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
