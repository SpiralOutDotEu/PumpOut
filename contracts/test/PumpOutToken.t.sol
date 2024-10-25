// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PumpOutToken.sol";
import "../src/PeerToken.sol";

contract PumpOutTokenTest is Test {
    PumpOutToken token;

    // Addresses for testing
    address minter;
    address owner;
    address protocolFeeCollector;
    address buyer;

    // Constants for testing
    uint256 availableSupply = 800_000_000; // Example available supply
    uint256 lpSupply = 200_000_000; // Example LP supply
    uint256 kValue = 69_000; // Bonding curve multiplier
    uint256 protocolFee = 100; // 1% fee in basis points

    // Events to capture
    event LiquidityAdded(uint256 ethAmount, uint256 tokenAmount);
    event ProtocolFeeCollected(uint256 amount);
    event ThankYouForYourDonation(address sender);
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Add receive() function to accept Ether in the test contract
    receive() external payable {}

    function setUp() public {
        // Initialize addresses
        minter = address(0x1);
        owner = address(this); // The test contract acts as the owner
        protocolFeeCollector = address(0x2);
        buyer = address(0x3);

        // Constructor parameters
        string memory name = "PumpOutToken";
        string memory symbol = "POT";

        // Deploy the PumpOutToken contract
        token = new PumpOutToken(
            name, symbol, minter, owner, availableSupply, lpSupply, kValue, protocolFee, protocolFeeCollector
        );
    }

    /**
     * @notice Test token metadata (name and symbol).
     */
    function testTokenMetadata() public view {
        // Verify the token name and symbol
        assertEq(token.name(), "PumpOutToken");
        assertEq(token.symbol(), "POT");
    }

    /**
     * @notice Test the minter role.
     */
    function testMinterRole() public view {
        // Verify the minter is set correctly
        assertEq(token.minter(), minter);
    }

    /**
     * @notice Test the owner role.
     */
    function testOwnerRole() public view {
        // Verify the owner is set correctly
        assertEq(token.owner(), owner);
    }

    /**
     * @notice Test buying tokens with ETH and verify balances and protocol fee.
     */
    function testBuyTokens() public {
        // Allocate 10 ETH to the buyer
        vm.deal(buyer, 10 ether);
        uint256 protocolCollectorBalanceBefore = protocolFeeCollector.balance;

        // Estimate the minimum tokens expected from buying 1 ETH
        uint256 minTokens = token.estimateBuy(1 ether);

        // Simulate buyer purchasing tokens
        vm.prank(buyer);
        token.buy{value: 1 ether}(minTokens);

        // Verify buyer's token balance
        uint256 balance = token.balanceOf(buyer);
        assertTrue(balance > 0, "Buyer should have tokens after purchase");

        // Verify totalSupply equals buyer's balance
        uint256 totalSupply = token.totalSupply();
        assertEq(totalSupply, balance, "Total supply should match buyer's balance");

        // Calculate expected protocol fee (1% of 1 ETH)
        uint256 expectedFee = (1 ether * token.protocolFeePercentage()) / 10000;
        assertEq(
            protocolFeeCollector.balance - protocolCollectorBalanceBefore,
            expectedFee,
            "Protocol fee should be collected correctly"
        );
    }

    /**
     * @notice Test selling tokens for ETH and verify balances and protocol fee.
     */
    function testSellTokens() public {
        // Allocate 10 ETH to the buyer
        vm.deal(buyer, 10 ether);

        // Estimate and perform token purchase
        uint256 minTokens = token.estimateBuy(1 ether);

        vm.startPrank(buyer);
        token.buy{value: 1 ether}(minTokens);

        uint256 balance = token.balanceOf(buyer);
        assertTrue(balance > 0, "Buyer should have tokens after purchase");

        // Determine tokens to sell (half of the balance)
        uint256 tokensToSell = balance / 2;
        uint256 buyerBalanceBefore = buyer.balance;
        uint256 protocolCollectorBalanceBefore = protocolFeeCollector.balance;

        // Estimate minimum ETH expected from selling tokensToSell
        uint256 minEth = token.estimateSell(tokensToSell);

        // Simulate selling tokens
        token.sell(tokensToSell, minEth);
        vm.stopPrank();

        // Verify buyer's token balance decreased
        uint256 newBalance = token.balanceOf(buyer);
        assertEq(newBalance, balance - tokensToSell, "Buyer's token balance should decrease after selling");

        // Calculate expected refund based on contract's formula
        uint256 S0 = balance; // Before sell
        uint256 S1 = newBalance; // After sell
        uint256 numerator = token.k() * ((S0 * S0) - (S1 * S1));
        uint256 grossRefund = (numerator * 2) / token.SCALE_SQUARED();
        uint256 expectedFee = (grossRefund * token.protocolFeePercentage()) / 10000;
        uint256 netRefund = grossRefund - expectedFee;

        // Verify ETH refunded to buyer (considering protocol fee)
        uint256 buyerBalanceAfter = buyer.balance;
        uint256 actualRefund = buyerBalanceAfter - buyerBalanceBefore;

        // Define a reasonable relative delta (e.g., 0.1%)
        uint256 maxPercentDelta = 100; // 0.1% in basis points

        // Use relative approximate equality to account for rounding
        assertApproxEqRel(actualRefund, netRefund, maxPercentDelta, "Buyer should receive correct ETH after selling");

        // Verify protocol fee was collected
        uint256 protocolFeeCollected = protocolFeeCollector.balance - protocolCollectorBalanceBefore;
        assertEq(protocolFeeCollected, expectedFee, "Protocol fee should be collected correctly");

        // Verify totalSupply decreased
        uint256 totalSupply = token.totalSupply();
        assertEq(totalSupply, newBalance, "Total supply should decrease after selling");
    }

    /**
     * @notice Test adding liquidity by reaching TOKENS_FOR_SALE and verify events and state.
     */
    function testAddLiquidity() public {
        // Allocate sufficient ETH to the buyer
        vm.deal(buyer, 1_000_000 ether);

        // Fetch the remaining tokens for sale
        uint256 remainingTokens = token.remainingTokensForSale();
        assertEq(remainingTokens, token.TOKENS_FOR_SALE(), "Initially, all tokens should be available for sale");

        // Calculate the ETH required to buy the remaining tokens
        uint256 ethRequired = token.ethRequiredToBuyRemainingTokens();

        // Calculate expected protocol fee
        uint256 expectedFee = (ethRequired * token.protocolFeePercentage()) / 10000;

        // Calculate ETH allocated for liquidity
        uint256 expectedEthForLiquidity = ethRequired - expectedFee;

        // Estimate minimum tokens expected to buy the entire TOKENS_FOR_SALE
        uint256 minTokens = token.estimateBuy(ethRequired);

        // Expect Transfer event for LP tokens (minted to the contract)
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(0), address(token), token.LP_SUPPLY());

        // Expect LiquidityAdded event with correct ETH and token amounts
        vm.expectEmit(true, true, true, false);
        emit LiquidityAdded(expectedEthForLiquidity, token.LP_SUPPLY());

        // Expect ProtocolFeeCollected event
        vm.expectEmit(true, false, false, false);
        emit ProtocolFeeCollected(expectedFee);

        // Expect Transfer event for buyer's tokens (minted)
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(0), buyer, token.TOKENS_FOR_SALE());

        // Simulate buyer purchasing enough tokens to reach TOKENS_FOR_SALE
        vm.prank(buyer);
        token.buy{value: ethRequired}(minTokens);

        // Verify that the bonding curve is closed
        assertTrue(token.isCurveClosed(), "Bonding curve should be closed after reaching available supply");

        // Verify buyer's token balance equals TOKENS_FOR_SALE
        assertEq(token.balanceOf(buyer), token.TOKENS_FOR_SALE(), "Buyer should hold the entire available supply");

        // Verify the contract holds LP tokens
        assertEq(
            token.balanceOf(address(token)), token.LP_SUPPLY(), "Contract should hold LP tokens after adding liquidity"
        );
    }

    /**
     * @notice Test that the bonding curve closes after reaching TOKENS_FOR_SALE and prevents further buys/sells.
     */
    function testCurveClosedAfterReachingAvailableSupply() public {
        // Allocate sufficient ETH to the buyer
        vm.deal(buyer, 1_000_000 ether);

        // Fetch the remaining tokens for sale
        uint256 remainingTokens = token.remainingTokensForSale();
        assertEq(remainingTokens, token.TOKENS_FOR_SALE(), "Initially, all tokens should be available for sale");

        // Calculate the ETH required to buy the remaining tokens
        uint256 ethRequired = token.ethRequiredToBuyRemainingTokens();

        // Estimate minimum tokens expected
        uint256 minTokens = token.estimateBuy(ethRequired);

        // Simulate buying to reach TOKENS_FOR_SALE
        vm.prank(buyer);
        token.buy{value: ethRequired}(minTokens);

        // Verify the curve is closed
        assertTrue(token.isCurveClosed(), "Bonding curve should be closed after reaching available supply");

        // Attempt to buy more tokens should revert
        vm.expectRevert("Bonding curve is closed");
        uint256 minTokensExtra = token.estimateBuy(1 ether);
        vm.prank(buyer);
        vm.expectRevert("Bonding curve is closed");
        token.buy{value: 1 ether}(minTokensExtra);

        // Attempt to sell tokens should revert
        uint256 tokenBalance = token.balanceOf(buyer);
        vm.expectRevert("Bonding curve is closed");
        uint256 minEther = token.estimateSell(tokenBalance);
        vm.prank(buyer);
        vm.expectRevert("Bonding curve is closed");
        token.sell(tokenBalance, minEther);
    }

    /**
     * @notice Test the receive function when curve is open.
     */
    function testReceiveFunction() public {
        // Allocate ETH to a sender
        address sender = vm.addr(4);
        vm.deal(sender, 1 ether);
        uint256 initContractBalance = address(token).balance;

        // Expect the ThankYouForYourDonation event
        vm.expectEmit(true, false, false, false);
        emit ThankYouForYourDonation(sender);

        // Send ETH directly to the contract
        vm.prank(sender);
        (bool success,) = address(token).call{value: 1 ether}("");
        assertTrue(success, "Failed to send Ether to contract");
        assertEq(address(token).balance, initContractBalance + 1 ether, "Failed donation balance");
    }

    /**
     * @notice Test the receive function when curve is closed.
     */
    function testReceiveFunctionWhenCurveClosed() public {
        // Close the curve
        vm.deal(buyer, 1_000_000 ether);
        uint256 ethRequired = token.ethRequiredToBuyRemainingTokens();
        uint256 minTokens = token.estimateBuy(ethRequired);
        vm.prank(buyer);
        token.buy{value: ethRequired}(minTokens);

        // Verify the curve is closed
        assertTrue(token.isCurveClosed(), "Bonding curve should be closed");

        // Allocate ETH to a sender
        address sender = vm.addr(4);
        vm.deal(sender, 1 ether);

        uint256 initContractBalance = address(token).balance;
        // Attempt to send ETH directly to the contract should revert
        vm.prank(sender);
        vm.expectRevert();
        (bool _success,) = address(token).call{value: 1 ether}("");
        assertTrue(_success, "Failed receive function");
        assertEq(
            initContractBalance, address(token).balance, "Sending Ether to contract should revert when curve is closed"
        );
    }

    /**
     * @notice Test estimateBuy function.
     */
    function testEstimateBuy() public view {
        uint256 ethAmount = 1 ether;
        uint256 tokensExpected = token.estimateBuy(ethAmount);
        assertTrue(tokensExpected > 0, "Estimated tokens should be greater than zero");
    }

    /**
     * @notice Test estimateSell function.
     */
    function testEstimateSell() public {
        // Allocate 10 ETH to the buyer
        vm.deal(buyer, 10 ether);

        // Buy tokens first
        uint256 minTokens = token.estimateBuy(1 ether);
        vm.prank(buyer);
        token.buy{value: 1 ether}(minTokens);

        uint256 balance = token.balanceOf(buyer);
        uint256 tokensToSell = balance / 2;

        uint256 ethExpected = token.estimateSell(tokensToSell);
        assertTrue(ethExpected > 0, "Estimated ETH should be greater than zero");
    }

    /**
     * @notice Test that protocol fees are calculated and collected correctly.
     */
    function testProtocolFeeCalculation() public {
        // Allocate 10 ETH to the buyer
        vm.deal(buyer, 10 ether);
        uint256 protocolCollectorBalanceBefore = protocolFeeCollector.balance;

        // Estimate the minimum tokens expected from buying 1 ETH
        uint256 minTokens = token.estimateBuy(1 ether);

        // Simulate buyer purchasing tokens
        vm.prank(buyer);
        token.buy{value: 1 ether}(minTokens);

        // Calculate expected protocol fee (1% of 1 ETH)
        uint256 expectedFee = (1 ether * token.protocolFeePercentage()) / 10000;

        // Verify protocol fee was collected
        uint256 protocolFeeCollected = protocolFeeCollector.balance - protocolCollectorBalanceBefore;
        assertEq(protocolFeeCollected, expectedFee, "Protocol fee should be collected correctly");
    }
}
