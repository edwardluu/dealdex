// contracts/SimpleToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title SimpleNFT
 * @dev Very simple ERC721 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC721` functions.
 */
contract SimpleNFT is ERC721 {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC721(name, symbol) {
      for (uint tokenId = 1; tokenId < initialSupply; tokenId++) {
        _mint(msg.sender, tokenId);
      }
    }
}
