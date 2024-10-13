// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PeerToken.sol";

contract PeerTokenTest is Test {
    error CallerNotMinter(address caller);
    error InvalidMinterZeroAddress();

    event NewMinter(address newMinter);

    PeerToken token;
    address owner = address(0x1); // Simulate an owner account
    address minter = address(0x2); // Simulate a minter account
    address user = address(0x3); // Simulate a normal user account

    function setUp() public {
        // Deploy the PeerToken contract with name, symbol, minter, and owner
        token = new PeerToken("PeerToken", "PTK", minter, owner);
    }

    function testTokenMetadata() public view {
        // Verify token name and symbol
        assertEq(token.name(), "PeerToken");
        assertEq(token.symbol(), "PTK");
    }

    function testMinterSetCorrectly() public view {
        // Verify the minter is set correctly
        assertEq(token.minter(), minter);
    }

    function testOwnerSetCorrectly() public view {
        // Verify the owner is set correctly
        assertEq(token.owner(), owner);
    }

    function testMintByMinter() public {
        // Simulate minting tokens by the minter
        uint256 mintAmount = 1000 ether;
        vm.prank(minter); // Simulate the minter calling the mint function
        token.mint(user, mintAmount);

        // Verify that the user's balance increased by the mint amount
        assertEq(token.balanceOf(user), mintAmount);
    }

    function testMintByNonMinterFails() public {
        // Ensure a non-minter cannot mint
        uint256 mintAmount = 1000 ether;
        vm.prank(user); // Simulate a normal user trying to mint
        vm.expectRevert(abi.encodeWithSelector(PeerToken.CallerNotMinter.selector, user));
        token.mint(user, mintAmount);
    }

    function testSetMinterByOwner() public {
        // Test setting a new minter by the owner
        address newMinter = address(0x4);
        // Emit event and ensure it's detected correctly
        vm.expectEmit(true, true, true, true);
        emit NewMinter(newMinter);
        vm.prank(owner); // Simulate the owner calling the function
        token.setMinter(newMinter);

        // Verify the new minter is set correctly
        assertEq(token.minter(), newMinter);
    }

    function testSetMinterByNonOwnerFails() public {
        // Ensure a non-owner cannot set the minter
        address newMinter = address(0x4);
        vm.prank(user); // Simulate a normal user trying to change the minter
        vm.expectRevert();
        token.setMinter(newMinter);
    }

    function testSetMinterToZeroAddressFails() public {
        // Ensure setting the minter to the zero address reverts
        vm.prank(owner); // Simulate the owner calling the function
        vm.expectRevert(PeerToken.InvalidMinterZeroAddress.selector);
        token.setMinter(address(0));
    }

    function testBurnTokens() public {
        // Test burning tokens using the ERC20Burnable extension
        uint256 mintAmount = 1000 ether;
        vm.prank(minter); // Mint tokens to the user
        token.mint(user, mintAmount);

        vm.prank(user); // Simulate the user burning some tokens
        token.burn(500 ether);

        // Verify the balance is updated after burning
        assertEq(token.balanceOf(user), 500 ether);
    }

    function testBurnTokensFailsForNonHolder() public {
        // Ensure that a user cannot burn more tokens than they hold
        vm.prank(user); // Simulate a normal user trying to burn tokens
        vm.expectRevert();
        token.burn(1000 ether);
    }

    function testUpdateFunctionOverride() public {
        // Test the internal `_update` function override (inherited from BaseToken)
        // This function is likely used for specific token logic in `BaseToken`.
        // We can simulate a simple transfer to ensure the correct function is called.

        // Mint some tokens to the user
        uint256 mintAmount = 1000 ether;
        vm.prank(minter); // Mint tokens to the user
        token.mint(user, mintAmount);

        // Simulate a transfer from the user to another address and check if the internal logic works
        address recipient = address(0x5);
        vm.prank(user);
        token.transfer(recipient, 500 ether);

        // Verify the balances of both accounts
        assertEq(token.balanceOf(user), 500 ether);
        assertEq(token.balanceOf(recipient), 500 ether);
    }
}
