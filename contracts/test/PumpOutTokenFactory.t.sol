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
    uint256[] chainIds; // Example chain IDs (Ethereum, Binance, Polygon)
    uint256[] prices; // Prices for the chains
    uint256 minFee;
    uint256[] chainsToDeploy; // Ethereum and Binance

    function setUp() public {
        // Simulate addresses
        owner = address(0x1);
        operatorMinter = address(0x2);
        operatorOwner = address(0x3);

        // Initialize chain IDs and prices
        chainIds = [1, 56, 137]; // Example chain IDs (Ethereum, Binance, Polygon)
        prices = [0.01 ether, 0.005 ether, 0.002 ether]; // Prices for the chains
        minFee = 0.001 ether;
        chainsToDeploy = [1, 56]; // Ethereum and Binance

        // Deploy the factory contract with the owner, operatorMinter, operatorOwner, chainIds, prices, and minFee
        vm.prank(owner); // Simulate the owner deploying the contract
        factory = new PumpOutTokenFactory(owner, operatorMinter, operatorOwner, chainIds, prices, minFee);
    }

    function testSetChainPrice() public {
        uint256 newPrice = 0.02 ether;
        vm.prank(owner);
        factory.setChainPrice(1, newPrice);
        assertEq(factory.chainPrices(1), newPrice);
    }

    function testSetMinFee() public {
        uint256 newMinFee = 0.005 ether;
        vm.prank(owner);
        factory.setMinFee(newMinFee);
        assertEq(factory.minFee(), newMinFee);
    }

    function testGetRequiredAmount() public view {
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);
        uint256 expectedAmount = factory.chainPrices(1) + factory.chainPrices(56) + minFee;
        assertEq(requiredAmount, expectedAmount);
    }

    function testSetAvailableSupply() public {
        uint256 newAvailableSupply = 900_000_000;
        vm.prank(owner);
        factory.setAvailableSupply(newAvailableSupply);
        assertEq(factory.availableSupply(), newAvailableSupply);
    }

    function testSetLpSupply() public {
        uint256 newLpSupply = 250_000_000;
        vm.prank(owner);
        factory.setLpSupply(newLpSupply);
        assertEq(factory.lpSupply(), newLpSupply);
    }

    function testSetKValue() public {
        uint256 newKValue = 100_000;
        vm.prank(owner);
        factory.setKValue(newKValue);
        assertEq(factory.kValue(), newKValue);
    }

    function testSetProtocolFeePercentage() public {
        uint256 newProtocolFeePercentage = 200;
        vm.prank(owner);
        factory.setProtocolFeePercentage(newProtocolFeePercentage);
        assertEq(factory.protocolFeePercentage(), newProtocolFeePercentage);
    }

    function testSetProtocolFeeCollector() public {
        address newProtocolFeeCollector = address(0x5);
        vm.prank(owner);
        factory.setProtocolFeeCollector(newProtocolFeeCollector);
        assertEq(factory.protocolFeeCollector(), newProtocolFeeCollector);
    }

    function testCreatePumpOutTokenWithSufficientPayment() public {
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);
        vm.deal(owner, requiredAmount);
        vm.prank(owner);

        address tokenAddress = factory.createPumpOutToken{value: requiredAmount}("Pump Token", "PTK", chainsToDeploy);

        assertTrue(tokenAddress != address(0));
        assertEq(address(factory).balance, requiredAmount);
    }

    function testCreatePumpOutTokenWithInsufficientPayment() public {
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);
        vm.deal(owner, requiredAmount - 1);
        vm.prank(owner);
        vm.expectRevert(InsufficientPayment.selector);
        factory.createPumpOutToken{value: requiredAmount - 1}("Pump Token", "PTK", chainsToDeploy);
    }

    function testWithdrawEarnings() public {
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);
        vm.deal(owner, requiredAmount);
        vm.prank(owner);
        factory.createPumpOutToken{value: requiredAmount}("Pump Token", "PTK", chainsToDeploy);

        uint256 factoryBalance = address(factory).balance;
        assertEq(factoryBalance, requiredAmount);

        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        factory.withdrawEarnings();

        assertEq(address(factory).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + requiredAmount);
    }

    function testCreatePumpOutTokenEvent() public {
        uint256 requiredAmount = factory.getRequiredAmount(chainsToDeploy);
        vm.deal(owner, requiredAmount);
        vm.prank(owner);

        vm.expectEmit(false, true, true, true);
        emit PumpOutTokenCreated(
            address(0), // Cannot predict the address in advance
            "Pump Token",
            "PTK",
            operatorMinter,
            factory.availableSupply(),
            factory.lpSupply(),
            factory.kValue(),
            factory.protocolFeePercentage(),
            factory.protocolFeeCollector(),
            chainsToDeploy
        );

        address tokenAddress = factory.createPumpOutToken{value: requiredAmount}("Pump Token", "PTK", chainsToDeploy);
        assertTrue(tokenAddress != address(0));
    }

    function testCreatePeerToken() public {
        uint256 parentChain = 1;
        address parentToken = address(0x5);

        vm.prank(owner);

        vm.expectEmit(false, true, true, true);
        emit PeerTokenCreated(
            address(0), // Cannot predict the address in advance
            "Peer Token",
            "PTR",
            operatorMinter,
            parentChain,
            parentToken
        );

        address tokenAddress = factory.createPeerToken("Peer Token", "PTR", parentChain, parentToken);
        assertTrue(tokenAddress != address(0));
    }
}
