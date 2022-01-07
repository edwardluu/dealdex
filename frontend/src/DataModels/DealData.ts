import User from './User';


class Deal {
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
    tokenPrice?: number
    vestPercent?: number

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
                gateToken?: string,
                tokenPrice?: number,
                vestPercent?: number) {
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
        this.tokenPrice = tokenPrice
        this.vestPercent = vestPercent
    }

    static empty() {
        return new Deal(User.empty(), [], [])
    }
}

export {Deal}