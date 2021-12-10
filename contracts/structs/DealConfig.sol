// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './../enums/LockedDealConstraint.sol';

struct ParticipantAddresses {
    address dealCreator;
    address payable startup;
}

// ΔstartupTokens = -ΔinvestorTokens * tickValue / tickSize
struct TickDetails {
    // tick size in wei
    uint256 tickSize;
    // tick value in token bits
    uint256 tickValue;
}

struct InvestmentSizeConstraints {
    uint256 minInvestmentPerInvestor;
    uint256 maxInvestmentPerInvestor;
    uint256 minTotalInvestment;
    uint256 maxTotalInvestment;
}

struct InvestConfig {
    InvestmentSizeConstraints sizeConstraints;
    LockedDealConstraint lockConstraint;
    // address of (likely ERC721) token that investor needs to own to be able to invest
    address gateToken;
    // Unix timestamp after which investment is disallowed
    uint256 investmentDeadline;
}

struct ClaimRefundConfig {
    bool allowRefunds;
    LockedDealConstraint lockConstraint;
}

struct ClaimTokensConfig {
    address startupTokenAddress;
    LockedDealConstraint lockConstraint;
}

struct ClaimFundsConfig {
    // txn fee = total investment * feeBps / 10,000
    uint8 feeBps;
    LockedDealConstraint lockConstraint;
}

struct DealConfig {
    ParticipantAddresses participantAddresses;
    TickDetails tickDetails;
    InvestConfig investConfig;
    ClaimRefundConfig refundConfig;
    ClaimTokensConfig tokensConfig;
    ClaimFundsConfig fundsConfig;
}
