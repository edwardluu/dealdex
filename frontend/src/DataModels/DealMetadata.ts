

export default class DealMetadata {
    name: string
    dealAddress?: string

    constructor(name: string, dealAddress?: string) {
        this.name = name
        this.dealAddress = dealAddress
    }
}