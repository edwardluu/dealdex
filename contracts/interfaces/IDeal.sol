// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IDeal {
    function invest() external payable;
    function claimRefund() external;
    function claimTokens() external;
    function claimFunds() external;
}

