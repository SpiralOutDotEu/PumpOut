// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PumpOutToken.sol";
import "../src/PeerToken.sol";

contract PumpOutTokenTest is Test {
    PumpOutToken token;
    address minter = address(0x1); // Simulate a minter account
    address owner = address(0x2); // Simulate an owner account

    function setUp() public {
        // Deploy the PumpOutToken contract with name, symbol, minter, and owner
        token = new PumpOutToken("TestToken", "TTK", minter, owner);
    }

    function testTokenMetadata() public view {
        // Verify the token name and symbol
        assertEq(token.name(), "TestToken");
        assertEq(token.symbol(), "TTK");
    }

    function testMinterRole() public view {
        // Verify the minter is set correctly
        assertEq(token.minter(), minter);
    }

    function testOwnerRole() public view {
        // Verify the owner is set correctly
        assertEq(token.owner(), owner);
    }

    function testMinting() public {
        // Simulate minting tokens by the minter
        uint256 mintAmount = 1000 ether;
        vm.prank(minter); // Simulate the minter calling the function
        token.mint(minter, mintAmount);

        // Verify the balance of the minter after minting
        assertEq(token.balanceOf(minter), mintAmount);
    }

    function testTransferOwnership() public {
        // Test transferring ownership to a new owner
        address newOwner = address(0x3);
        vm.prank(owner); // Simulate the current owner calling the function
        token.transferOwnership(newOwner);

        // Verify the new owner is set correctly
        assertEq(token.owner(), newOwner);
    }
}
