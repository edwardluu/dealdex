// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./CloneFactory.sol";
import "./interfaces/ILockableDeal.sol";
import "./structs/DealConfig.sol";

// Upgradable contract (deployed via proxy)
contract DealFactory is CloneFactory, Initializable {

    // State Variables
    // Because this contract is upgradable, you can NEVER replace or remove this state
    // variable (storage collision). You are free to append to it
    address dealContractAddress;
    address payable feeBeneficiaryAddress;

    function getDealAddress() external view returns (address) { return dealContractAddress; }
    function getFeeBeneficiaryAddress() external view returns (address) { return feeBeneficiaryAddress; }

    // Initializer
    // You CANNOT have a 'constructor' in this contract because it is upgradable
    // and constructors are not deployed in the runtime bytecode. Thus we
    // use a normal 'initializer' function (the name of this function is specified
    // in the deployProxy) and use Initializable to ensure it's called exactly once
    function initialize(address _dealContractAddress, address payable _feeBeneficiaryAddress) public initializer {
        dealContractAddress = _dealContractAddress;
        feeBeneficiaryAddress = _feeBeneficiaryAddress;
    }

    // Events
    event DealCreated(address indexed creator, Deal deal);

    // Public Functions
    function createDeal(DealConfig memory _dealConfig) public {
        Deal deal = Deal(createClone(dealContractAddress));
        deal.init(_dealConfig, feeBeneficiaryAddress);
        emit DealCreated(_dealConfig.participantAddresses.dealCreator, deal);
    }
}


contract Deal is ILockableDeal {

    DealConfig public config;
    address payable feeBeneficiaryAddress;

    address[] public investors;
    mapping(address => uint256) public investorToReceivedAmount;
    mapping(address => uint256) public investorToClaimedTokens;

    uint256 public totalReceivedInvestment;
    bool public isLockedFlag;

    // Initializers

    function init(DealConfig memory _dealConfig, address payable _feeBeneficiaryAddress) external {
        config = _dealConfig;
        feeBeneficiaryAddress = _feeBeneficiaryAddress;
        totalReceivedInvestment = 0;
        isLockedFlag = (config.investConfig.sizeConstraints.minTotalInvestment == 0);
    }

    // When calling this function make sure the amount sent is a multiple of tickSize
    function invest() external payable override {
        require(investorToReceivedAmount[msg.sender] == 0, "Cannot invest multiple times");
        require(msg.value >= config.investConfig.sizeConstraints.minInvestmentPerInvestor, "Investment amount is too low");
        require(msg.value <= config.investConfig.sizeConstraints.maxInvestmentPerInvestor, "Investment amount is too high");
        require(msg.value + totalReceivedInvestment <= config.investConfig.sizeConstraints.maxTotalInvestment, "Investment will exceed total investment cap");
        require(msg.value % config.tickDetails.tickSize == 0, "Investment amount must be a multiple of tick size");
        require(!deadlineHasPassed(), "Investment deadline has passed");
        require(address(0) == config.investConfig.gateToken || 0 < IERC721(config.investConfig.gateToken).balanceOf(msg.sender), "Potential investor does not own requisite NFT for this gated deal");
        require(isValidLockStatus(config.investConfig.lockConstraint), "Cannot invest because the lock flag value was rejected");

        investorToReceivedAmount[msg.sender] = msg.value;
        totalReceivedInvestment += msg.value;
        // The funds are locked once the investment goal has been reached
        isLockedFlag = (totalReceivedInvestment >= config.investConfig.sizeConstraints.minTotalInvestment);
        investors.push(msg.sender);
    }

    // The startup can claim all funds as long as the deadline has passed and the deal is valid
    function claimFunds() external override {
        require(msg.sender == config.participantAddresses.startup, "Only the startup can claim the funds");
        require(isValidLockStatus(config.fundsConfig.lockConstraint), "Cannot claim funds because the lock flag value was rejected");

        // TODO: If we want to make sure tokens have been deposited before fund withdrawal, we can make that check here

        // We use call() instead of transfer() because of the Istanbul hard fork
        uint256 fee = address(this).balance * config.fundsConfig.feeBps / 10000;
        (bool feeSuccess, ) = feeBeneficiaryAddress.call{value:fee}("");
        require(feeSuccess, "Fee payment failed.");
        (bool transferSuccess, ) = config.participantAddresses.startup.call{value:address(this).balance}("");
        require(transferSuccess, "Transfer failed.");
    }

    // Investors can get a refund as long as the investment deadline has not passed or if the deal is invalid.
    function claimRefund() external override {
        require(config.refundConfig.allowRefunds, "Deal disallows refunds");
        require(isValidLockStatus(config.refundConfig.lockConstraint), "Cannot claim refund because the lock flag value was rejected");

        uint256 amountToRefund = investorToReceivedAmount[msg.sender];
        require(amountToRefund > 0, "Only an investor can receive a refund");

        // Set this first to prevent re-entrance
        for(uint i = 0; i < investors.length; i++){
            if (investors[i] == msg.sender) {
                delete investors[i];
            }
        }
        totalReceivedInvestment -= amountToRefund;
        investorToReceivedAmount[msg.sender] = 0;

        // Need to use call() instead of transfer() because of the Istanbul hard fork
        (bool success, ) = msg.sender.call{value:amountToRefund}("");

        if (!success) {            
            // Revert state changes
            investors.push(msg.sender);
            totalReceivedInvestment += amountToRefund;
            investorToReceivedAmount[msg.sender] = amountToRefund;
        }
    }


    // Investors can claim tokens as long as they have invested, have not claimed their tokens yet, and the contract has tokens
    function claimTokens() external override {
        require(address(0) != config.tokensConfig.startupTokenAddress, "Startup token not yet specified");
        require(isValidLockStatus(config.tokensConfig.lockConstraint), "Cannot claim tokens because the lock flag value was rejected");
        uint256 receivedInvestment = investorToReceivedAmount[msg.sender];
        require(receivedInvestment > 0, "Must be an investor to claim tokens");
        uint256 tokensToClaim = receivedInvestment * config.tickDetails.tickValue / config.tickDetails.tickSize;
        tokensToClaim -= investorToClaimedTokens[msg.sender];
        require(tokensToClaim > 0, "You have no more tokens to claim");
        IERC20 startupToken = IERC20(config.tokensConfig.startupTokenAddress);
        uint256 availableTokens = startupToken.balanceOf(address(this));
        require(availableTokens >= tokensToClaim, "Contract does not have enough tokens to send");

        investorToClaimedTokens[msg.sender] += tokensToClaim;

        bool result = startupToken.transfer(msg.sender, tokensToClaim);

        if (!result) {
            // Transfer failed, revert state
            investorToClaimedTokens[msg.sender] -= tokensToClaim;
        }
    }

    // Setters
    function setStartupToken(address _startupTokenAddress, TickDetails memory _tickDetails) external {
        require(msg.sender == config.participantAddresses.startup, "Only the startup can set the startup token");
        config.tokensConfig.startupTokenAddress = _startupTokenAddress;
        config.tickDetails = _tickDetails;
    }

    // Getters
    function isLocked() external view override returns(bool) {
        return isLockedFlag;
    }

    function getInvestors() external view returns(address[] memory _investors, 
                                                    uint256[] memory _investments,
                                                    uint256[] memory _claimedTokens) {
        _investors = new address[](investors.length);
        _investments = new uint256[](investors.length);
        _claimedTokens = new uint256[](investors.length);
        
       for(uint i = 0; i < investors.length; i++){
            _investors[i] = investors[i];
            _investments[i] = investorToReceivedAmount[investors[i]];
            _claimedTokens[i] = investorToClaimedTokens[investors[i]];
        }
    }

    // Private Helper Functions
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function deadlineHasPassed() internal view returns (bool) {
        return block.timestamp > config.investConfig.investmentDeadline;
    }

    function isValidLockStatus(LockedDealConstraint c) internal view returns (bool) {
        return ((c == LockedDealConstraint.NO_CONSTRAINT) ||
                (c == LockedDealConstraint.REQUIRE_LOCKED && isLockedFlag) ||
                (c == LockedDealConstraint.REQUIRE_UNLOCKED && !isLockedFlag));
    }
}

