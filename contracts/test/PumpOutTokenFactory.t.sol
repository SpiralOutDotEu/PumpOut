// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PumpOutTokenFactory.sol";
import "../src/PumpOutToken.sol";

contract PumpOutTokenFactoryTest is Test {
    event PumpOutTokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address minter,
        uint256 availableSupply,
        uint256 lpSupply,
        uint256 k,
        uint256 protocolFeePercentage,
        address protocolFeeCollector,
        uint256[] chainIds
    );
    event PeerTokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address minter,
        uint256 parentChain,
        address parentToken
    );

    error UnsuportedChain();
    error InsufficientPayment();

    PumpOutTokenFactory factory;
    address owner; // Simulate an owner account
    address operatorMinter;
    address operatorOwner;
    address protocolFeeCollector;
    uint256[] chainIds; // Example chain ids (Ethereum, Binance, Polygon)
    uint256[] prices; // Prices for the chains
    uint256 minFee;
    uint256[] chainsToDeploy; // Ethereum 1, 56 BSC

    // Token parameters
    uint256 availableSupply;
    uint256 lpSupply;
    uint256 kValue;
    uint256 protocolFeePercentage;

    function setUp() public {
        // Simulate addresses
        owner = address(0x1);
        operatorMinter = address(0x2);
        operatorOwner = address(0x3);
        protocolFeeCollector = address(0x4);

        // Initialize chain IDs and prices
        chainIds = [1, 56, 137]; // Example chain IDs (Ethereum, Binance, Polygon)
        prices = [0.01 ether, 0.005 ether, 0.002 ether]; // Prices for the chains
        minFee = 0.001 ether;
        chainsToDeploy = [1, 56]; // Ethereum and Binance

        // Initialize token parameters
        availableSupply = 800_000_000; // Example available supply
        lpSupply = 200_000_000; // Example LP supply
        kValue = 69_000; // Bonding curve multiplier
        protocolFeePercentage = 100; // 1% fee in basis points

        // Deploy the factory contract with the owner, operatorMinter, operatorOwner, chainIds, prices, and minFee
        vm.prank(owner); // Simulate the owner deploying the contract
        factory = new PumpOutTokenFactory(owner, operatorMinter, operatorOwner, chainIds, prices, minFee);
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
        uint256 expectedAmount = factory.chainPrices(1) + factory.chainPrices(56) + minFee;
        assertEq(requiredAmount, expectedAmount);
    }

    function testCreatePumpOutTokenWithSufficientPayment() public {
        // Test successful creation of a PumpOutToken
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        vm.deal(owner, requiredAmount); // Give the owner sufficient funds
        vm.prank(owner); // The owner deploys the token

        address tokenAddress = factory.createPumpOutToken{value: requiredAmount}(
            "Pump Token",
            "PTK",
            availableSupply,
            lpSupply,
            kValue,
            protocolFeePercentage,
            protocolFeeCollector,
            chainsToDeploy
        );

        // Verify the token was created
        assertTrue(tokenAddress != address(0));

        // Verify the factory holds the correct balance
        assertEq(address(factory).balance, requiredAmount);
    }

    function testCreatePumpOutTokenWithInsufficientPayment() public {
        // Test error handling with insufficient payment
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        vm.deal(owner, requiredAmount - 1); // Provide insufficient funds
        vm.prank(owner); // Simulate the owner calling the function
        vm.expectRevert(InsufficientPayment.selector); // Expect the error

        factory.createPumpOutToken{value: requiredAmount - 1}(
            "Pump Token",
            "PTK",
            availableSupply,
            lpSupply,
            kValue,
            protocolFeePercentage,
            protocolFeeCollector,
            chainsToDeploy
        );
    }

    function testWithdrawEarnings() public {
        // Test withdrawing earnings to the owner
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        vm.deal(owner, requiredAmount);
        vm.prank(owner);
        factory.createPumpOutToken{value: requiredAmount}(
            "Pump Token",
            "PTK",
            availableSupply,
            lpSupply,
            kValue,
            protocolFeePercentage,
            protocolFeeCollector,
            chainsToDeploy
        );

        uint256 factoryBalance = address(factory).balance;
        assertEq(factoryBalance, requiredAmount);

        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        factory.withdrawEarnings();

        // Verify the factory balance is 0 after withdrawal
        assertEq(address(factory).balance, 0);

        // Verify the owner's balance has increased by the factory balance
        uint256 ownerBalanceAfter = owner.balance;
        assertEq(ownerBalanceAfter - ownerBalanceBefore, requiredAmount);
    }

    function testCreatePumpOutTokenEvent() public {
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);

        vm.deal(owner, requiredAmount); // Give the owner sufficient funds
        vm.prank(owner); // The owner deploys the token

        // Expect the event to be emitted
        vm.expectEmit(false, true, true, true);
        emit PumpOutTokenCreated(
            address(0), // We cannot predict the actual address in advance
            "Pump Token",
            "PTK",
            operatorMinter,
            availableSupply,
            lpSupply,
            kValue,
            protocolFeePercentage,
            protocolFeeCollector,
            chainsToDeploy
        );

        address tokenAddress = factory.createPumpOutToken{value: requiredAmount}(
            "Pump Token",
            "PTK",
            availableSupply,
            lpSupply,
            kValue,
            protocolFeePercentage,
            protocolFeeCollector,
            chainsToDeploy
        );

        // Verify that the token address is not zero
        assertTrue(tokenAddress != address(0));
    }

    function testCreatePeerToken() public {
        uint256 parentChain = 1; // Parent chain is Ethereum in this case
        address parentToken = address(0x5); // Simulated parent token address

        vm.prank(owner); // Simulate the owner calling the function

        // Expect the event to be emitted
        vm.expectEmit(false, true, true, true);
        emit PeerTokenCreated(
            address(0), // We cannot predict the actual address in advance
            "Peer Token",
            "PTR",
            operatorMinter,
            parentChain,
            parentToken
        );

        // Create PeerToken
        address tokenAddress = factory.createPeerToken("Peer Token", "PTR", parentChain, parentToken);

        // Verify the token was created
        assertTrue(tokenAddress != address(0));
    }
}
