// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PumpOutTokenFactory.sol";
import "../src/PumpOutToken.sol";

contract PumpOutTokenFactoryTest is Test {
    error UnsuportedChain();
    error InsufficientPayment();

    PumpOutTokenFactory factory;
    address owner = address(0x1); // Simulate an owner account
    uint256[] chainIds = [1, 56, 137]; // Example chain ids (Ethereum, Binance, Polygon)
    uint256[] prices = [0.01 ether, 0.005 ether, 0.002 ether]; // Prices for the chains
    uint256 minFee = 0.001 ether;
    uint256[] chainsToDeploy = [1, 56]; // Ethereum 1, 56 BSC

    function setUp() public {
        // Deploy the factory contract with the owner, chainIds, prices, and minFee
        factory = new PumpOutTokenFactory(owner, chainIds, prices, minFee);
    }

    function testSetChainPrice() public {
        // Test setting chain price
        uint256 newPrice = 0.02 ether;
        vm.prank(owner); // Simulate the owner calling the function
        factory.setChainPrice(1, newPrice);

        // Verify the price was updated
        assertEq(factory.chainPrices(1), newPrice);
    }

    function testSetMinFee() public {
        // Test setting minimum fee
        uint256 newMinFee = 0.005 ether;
        vm.prank(owner); // Simulate the owner calling the function
        factory.setMinFee(newMinFee);

        // Verify the minFee was updated
        assertEq(factory.minFee(), newMinFee);
    }

    function testGetRequiredAmount() public view {
        // Test calculating the required amount for deployment
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        // Verify the correct total is returned (sum of prices + minFee)
        uint256 expectedAmount = prices[0] + prices[1] + minFee;
        assertEq(requiredAmount, expectedAmount);
    }

    function testCreatePumpOutTokenWithSufficientPayment() public {
        // Test successful creation of a PumpOutToken
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        vm.deal(owner, requiredAmount); // Give the owner sufficient funds
        vm.prank(owner); // The owner deploys the token
        address tokenAddress =
            factory.createPumpOutToken{value: requiredAmount}("Pump Token", "PTK", owner, owner, chainsToDeploy);

        // Verify the token was created and emitted event
        assertTrue(tokenAddress != address(0));

        // Verify the factory holds the correct balance
        assertEq(address(factory).balance, requiredAmount);
    }

    function testCreatePumpOutTokenWithInsufficientPayment() public {
        // Test error handling with insufficient payment
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        vm.prank(owner); // Simulate the owner calling the function
        vm.expectRevert(); // Expect the error
        factory.createPumpOutToken{value: requiredAmount - 1}("Pump Token", "PTK", owner, owner, chainsToDeploy);
    }

    function testWithdrawEarnings() public {
        // Test withdrawing earnings to the owner
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        vm.deal(owner, requiredAmount);
        vm.prank(owner);
        factory.createPumpOutToken{value: requiredAmount}("Pump Token", "PTK", owner, owner, chainsToDeploy);

        uint256 factoryBalance = address(factory).balance;
        assertEq(factoryBalance, requiredAmount);

        vm.prank(owner);
        factory.withdrawEarnings();

        // Verify the factory balance is 0 after withdrawal
        assertEq(address(factory).balance, 0);

        // Verify the owner's balance has increased by the factory balance
        assertEq(owner.balance, requiredAmount);
    }
}
