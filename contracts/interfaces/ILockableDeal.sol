// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './IDeal.sol';

// A "locked" deal will go to completion and cannot be canceled
interface ILockableDeal is IDeal {
    function isLocked() external view returns(bool);
}

