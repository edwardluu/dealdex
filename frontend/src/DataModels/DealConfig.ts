import {ethers, BigNumber, Signer, providers } from 'ethers';
import {BigNumber as BigNumberJS} from "bignumber.js"

class DealConfig {
    participantAddresses: DealParticipantAddresses
    dealExchangeRate: DealExchangeRate
    investConfig: InvestConfig
    refundConfig: RefundConfig
    tokensConfig: TokensConfig
    fundsConfig: FundsConfig

    constructor(participantAddresses: DealParticipantAddresses,
                dealExchangeRate: DealExchangeRate,
                investConfig: InvestConfig,
                refundConfig: RefundConfig,
                tokensConfig: TokensConfig,
                fundsConfig: FundsConfig) {
        this.participantAddresses = participantAddresses
        this.dealExchangeRate = dealExchangeRate
        this.investConfig = investConfig
        this.refundConfig = refundConfig
        this.tokensConfig = tokensConfig
        this.fundsConfig = fundsConfig
    }

    toSmartContractInput() {
        return [
            this.participantAddresses.toSmartContractInput(),
            this.dealExchangeRate.toSmartContractInput(),
            this.investConfig.toSmartContractInput(),
            this.refundConfig.toSmartContractInput(),
            this.tokensConfig.toSmartContractInput(),
            this.fundsConfig.toSmartContractInput()
        ]
    }

}

class DealParticipantAddresses {
    dealCreatorAddress: string
    projectAddress: string

    constructor(dealCreatorAddress: string, projectAddress: string) {
        this.dealCreatorAddress = dealCreatorAddress
        this.projectAddress = projectAddress
    }

    toSmartContractInput() {
        return [this.dealCreatorAddress, this.projectAddress];
    }
}

class DealExchangeRate {
    ethPerToken: string
    tickSize: BigNumber // amt of wei per
    tickValue: BigNumber // amt of token bits

    constructor(ethPerToken: string, tokenDecimals: number) {
        this.ethPerToken = ethPerToken;
        [this.tickSize, this.tickValue] = DealExchangeRate.getTickSizeAndValue(ethPerToken, tokenDecimals)
    }

    static init(tickSize: BigNumber, tickValue: BigNumber, tokenDecimals: number) {
        let ethPerToken = DealExchangeRate.getEthPerToken(tickSize, tickValue, tokenDecimals)

        let exchangeRate = new DealExchangeRate(ethPerToken, tokenDecimals)

        return exchangeRate
    }

    static undefined() {
        let exchangeRate = new DealExchangeRate("0", 0)
        exchangeRate.tickSize = BigNumber.from("0")
        exchangeRate.tickValue = BigNumber.from("0")
        return exchangeRate
    }

    static getTickSizeAndValue(ethPerToken: string, tokenDecimals: number): [BigNumber, BigNumber] {
        const multiplier = (new BigNumberJS(10)).exponentiatedBy(18 - tokenDecimals)
        const bigEthPerToken = new BigNumberJS(ethPerToken)
    
        const weiPerTokenBits = bigEthPerToken.multipliedBy(multiplier)
    
        let [tickSize, tickValue] = weiPerTokenBits.toFraction()
    
        let bigTickSize = BigNumber.from(tickSize.toString())
        let bigTickValue =  BigNumber.from(tickValue.toString())
    
        return [bigTickSize, bigTickValue]
    }

    static getEthPerToken(tickSize: BigNumber, tickValue: BigNumber, tokenDecimals: number): string {
        const bigTickSize = new BigNumberJS(tickSize.toString())
        const bigTickValue = new BigNumberJS(tickValue.toString())
        const weiPerTokenBits = bigTickSize.dividedBy(bigTickValue)
    
        const multiplier = (new BigNumberJS(10)).exponentiatedBy(tokenDecimals - 18)
    
        const ethPerToken = weiPerTokenBits.multipliedBy(multiplier)
        return ethPerToken.toString()
    }

    toSmartContractInput() {
        return [this.tickSize, this.tickValue]
    }
}

class InvestConfig {
    minWeiPerInvestor: BigNumber
    maxWeiPerInvestor: BigNumber
    minTotalWei: BigNumber
    maxTotalWei: BigNumber
    gateToken: string
    deadline: BigNumber

    constructor(minWeiPerInvestor: BigNumber, 
                maxWeiPerInvestor: BigNumber, 
                minTotalWei: BigNumber, 
                maxTotalWei: BigNumber,
                gateToken: string | undefined,
                deadline: BigNumber) {
        this.gateToken = gateToken || ethers.constants.AddressZero
        this.minWeiPerInvestor = minWeiPerInvestor
        this.maxWeiPerInvestor = maxWeiPerInvestor
        this.minTotalWei = minTotalWei
        this.maxTotalWei = maxTotalWei
        this.deadline = deadline
    }

    toSmartContractInput() {
        const _investmentSizeConstraints = [
            this.minWeiPerInvestor, 
            this.maxWeiPerInvestor, 
            this.minTotalWei, this.maxTotalWei
        ]

        return [
            _investmentSizeConstraints, 
            /* lockConstraint = NO_CONSTRAINT */ 0, 
            /* gateToken */ this.gateToken, 
            this.deadline
        ];
    }
}

class RefundConfig {
    toSmartContractInput() {
        return [/* allowRefunds */ true, /* lockConstraint = REQUIRE_UNLOCKED */ 2];
    }
}

class TokensConfig {
    projectToken: string

    constructor(projectToken: string | undefined) {
        if (projectToken === undefined || projectToken === "") {
            this.projectToken = ethers.constants.AddressZero
        } else {
            this.projectToken = projectToken
        }
    }

    toSmartContractInput() {
        return [this.projectToken, /* lockConstraint = REQUIRE_LOCKED */ 1]
    }
}

class FundsConfig {
    toSmartContractInput() {
        return [/* feeBps */ 0, /* lockConstraint = REQUIRE_LOCKED */ 1];
    }
}


export {DealConfig, DealParticipantAddresses, DealExchangeRate, InvestConfig, RefundConfig, TokensConfig, FundsConfig}