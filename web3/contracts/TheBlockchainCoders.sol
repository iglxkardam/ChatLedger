// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TheBlockchainCoders
 * @dev An ERC20 token with a large initial supply
 *
 * This is a standard ERC20 token contract that creates a token named "TheBlockchainCoders"
 * with symbol "LTUM". It mints the entire supply of 10 billion tokens to the contract deployer.
 * The contract inherits from OpenZeppelin's ERC20 implementation for security and standards compliance.
 * 
 * Features:
 * - Fixed supply of 10 billion tokens (with 18 decimals)
 * - Standard ERC20 functionality (transfer, approve, transferFrom)
 * - All tokens minted to contract deployer at creation
 */
contract TheBlockchainCoders is ERC20 {
    // Initial token supply (10 billion tokens)
    uint256 private constant INITIAL_SUPPLY = 10_000_000_000;
    
    /**
     * @dev Constructor that initializes the token with name and symbol
     * and mints the entire supply to the deployer's address
     */
    constructor() ERC20("TheBlockchainCoders", "TBC") {
        // Mint the entire supply to the contract deployer
        // Note: ERC20 uses 18 decimals by default, so we multiply by 10^18
        _mint(msg.sender, INITIAL_SUPPLY * (10 ** decimals()));
    }
}