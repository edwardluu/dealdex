import User from './User';


class Deal {
    name?: string                           // Step 1 - 1 item
    startup: User
    investors: User[]
    investorAmounts: string[]
    startupTokenAddress?: string
    minInvestmentPerInvestor?: string
    maxInvestmentPerInvestor?: string
    minTotalInvestment?: string
    maxTotalInvestment?: string
    tokensInContract?: string
    ethInContract?: string
    gateToken?: string
    ethNFTPerToken?: string                 // Step 2 - 1 item
    paymentToken?: string                   // Step 2 - 2 item
    minRoundSize?: number                   // Step 2 - 3 item
    maxRoundSize?: number                   // Step 2 - 4 item
    minInvestment?: number                  // Step 2 - 5 item
    maxInvestment?: number                  // Step 2 - 6 item
    investDeadline?: Date                   // Step 2 - 7 item
    dealAddress?: string                    // Step 3 - 1 item
    tokenPrice?: number                     // Step 3 - 2 item
    ethPerToken?: string                    // Step 3 - 3 item
    vestDate?: Date                         // Step 3 - 4 item
    vestPercent?: number                    // Step 3 - 5 item

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
                vestDate?: Date,
                tokensInContract?: string,
                ethInContract?: string,
                gateToken?: string,
                tokenPrice?: number,
                vestPercent?: number,                
                ethNFTPerToken?: string,
                paymentToken?: string,
                minRoundSize?: number,
                maxRoundSize?: number,
                minInvestment?: number,
                maxInvestment?: number,
                investDeadline?: Date) {
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
        this.vestDate = vestDate
        this.tokensInContract = tokensInContract
        this.ethInContract = ethInContract
        this.gateToken = gateToken
        this.tokenPrice = tokenPrice
        this.vestPercent = vestPercent
        this.ethNFTPerToken = ethNFTPerToken
        this.paymentToken = paymentToken
        this.minRoundSize = minRoundSize
        this.maxRoundSize = maxRoundSize
        this.minInvestment = minInvestment
        this.maxInvestment = maxInvestment
        this.investDeadline = investDeadline
    }

    static empty() {
        return new Deal(User.empty(), [], [])
    }
}

export {Deal}