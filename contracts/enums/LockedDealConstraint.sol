// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// A "locked" deal will go to completion and cannot be canceled
enum LockedDealConstraint {
    NO_CONSTRAINT, 
    REQUIRE_LOCKED,
    REQUIRE_UNLOCKED
}
