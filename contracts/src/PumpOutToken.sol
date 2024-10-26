// SPDX-License-Identifier: Apache 2
pragma solidity >=0.6.12 <0.9.0;

import "./PeerToken.sol";
import "./BondingCurveLib.sol";

contract PumpOutToken is PeerToken {
    using BondingCurveLib for uint256;

    // Custom Errors
    error CurveClosed(); // Error when the bonding curve is closed
    error NoETHSent(); // Error when no ETH is sent during a purchase
    error LowBalance(); // Error when seller's token balance is too low
    error NoTokens(); // Error when zero tokens are provided in a sell order
    error Slippage(); // Error for minimum slippage protection not met
    error ETHSendFailed(); // Error when ETH transfer fails
    error FeeSendFailed(); // Error when protocol fee transfer fails

    // Events
    event LiquidityAdded(uint256 ethAmount, uint256 tokenAmount);
    event ProtocolFeeCollected(uint256 amount);
    event ThankYouForYourDonation(address sender);

    // Constants for the bonding curve
    uint256 public TOKENS_FOR_SALE;
    uint256 public LP_SUPPLY;
    uint256 public k; // bonding curve multiplier constant
    uint256 public MAX_SUPPLY;

    // Protocol fee percentage (in basis points, e.g., 100 = 1%)
    uint256 public protocolFeePercentage = 100;
    address private protocolFeeCollector;

    // State variables
    bool public isCurveClosed = false;

    /**
     * @notice Initializes bonding curve parameters.
     * @param _name Token name.
     * @param _symbol Token symbol.
     * @param _minter Address allowed to mint tokens.
     * @param _owner Contract owner address.
     * @param _availableSupply Tokens available for sale under the bonding curve.
     * @param _lpSupply Tokens reserved for liquidity provision.
     * @param _k The bonding curve multiplier.
     * @param _protocolFeePercentage Protocol fee in basis points.
     * @param _protocolFeeCollector Address to collect protocol fees.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _minter,
        address _owner,
        uint256 _availableSupply,
        uint256 _lpSupply,
        uint256 _k,
        uint256 _protocolFeePercentage,
        address _protocolFeeCollector
    ) PeerToken(_name, _symbol, _minter, _owner) {
        TOKENS_FOR_SALE = _availableSupply * 10 ** 18;
        LP_SUPPLY = _lpSupply * 10 ** 18;
        k = _k;
        protocolFeePercentage = _protocolFeePercentage;
        protocolFeeCollector = _protocolFeeCollector;
        MAX_SUPPLY = TOKENS_FOR_SALE + LP_SUPPLY;
    }

    /**
     * @notice Returns the remaining tokens available for sale.
     * @return remainingTokens The number of tokens still available for sale.
     */
    function remainingTokensForSale() public view returns (uint256 remainingTokens) {
        if (isCurveClosed) return 0;
        uint256 S0 = totalSupply();
        remainingTokens = TOKENS_FOR_SALE - S0;
    }

    /**
     * @notice Calculates the ETH required to buy all remaining tokens.
     * @return ethRequired The amount of ETH required to buy the remaining tokens.
     */
    function ethRequiredToBuyRemainingTokens() public view returns (uint256 ethRequired) {
        if (isCurveClosed) return 0;
        uint256 S0 = totalSupply();
        uint256 S1 = TOKENS_FOR_SALE;
        ethRequired = BondingCurveLib.calculateAmountPaid(S0, S1, k);
        ethRequired = (ethRequired * 10000) / (10000 - protocolFeePercentage);
    }

    /**
     * @notice Buys tokens with ETH, ensuring a minimum number of tokens received.
     * @param minTokens Minimum number of tokens expected by the buyer.
     */
    function buy(uint256 minTokens) external payable {
        if (isCurveClosed) revert CurveClosed();
        if (msg.value == 0) revert NoETHSent();

        uint256 initialProtocolFee = (msg.value * protocolFeePercentage) / 10000;
        uint256 amountPaid = msg.value - initialProtocolFee;

        uint256 S0 = totalSupply();
        uint256 S1 = BondingCurveLib.calculateS1Buy(S0, amountPaid, k);
        uint256 tokensToMint = S1 - S0;

        if (tokensToMint < minTokens) revert Slippage();

        if (S1 >= TOKENS_FOR_SALE) {
            S1 = TOKENS_FOR_SALE;
            tokensToMint = TOKENS_FOR_SALE - S0;

            amountPaid = BondingCurveLib.calculateAmountPaid(S0, S1, k);
            uint256 protocolFee = initialProtocolFee;
            uint256 refund = msg.value - amountPaid - protocolFee;
            if (refund > 0) payable(msg.sender).transfer(refund);

            isCurveClosed = true;
            addLiquidity(address(this).balance - protocolFee);
        }
        _transferProtocolFee(initialProtocolFee);
        _mint(msg.sender, tokensToMint);
    }

    /**
     * @notice Sells tokens for ETH, ensuring a minimum ETH received.
     * @param tokensToSell Number of tokens to sell.
     * @param minETH Minimum amount of ETH expected by the seller.
     */
    function sell(uint256 tokensToSell, uint256 minETH) external {
        if (isCurveClosed) revert CurveClosed();
        if (balanceOf(msg.sender) < tokensToSell) revert LowBalance();
        if (tokensToSell == 0) revert NoTokens();

        uint256 S0 = totalSupply();
        uint256 S1 = S0 - tokensToSell;
        uint256 grossRefund = BondingCurveLib.calculateSellRefund(S0, S1, k);

        uint256 protocolFee = (grossRefund * protocolFeePercentage) / 10000;
        uint256 netRefund = grossRefund - protocolFee;

        if (netRefund < minETH) revert Slippage();

        _burn(msg.sender, tokensToSell);
        _transferProtocolFee(protocolFee);

        (bool sent,) = msg.sender.call{value: netRefund}("");
        if (!sent) revert ETHSendFailed();
    }

    /**
     * @dev Internal function to transfer protocol fees.
     * @param feeAmount Amount to transfer as protocol fee.
     */
    function _transferProtocolFee(uint256 feeAmount) internal {
        if (feeAmount > 0) {
            (bool sent,) = protocolFeeCollector.call{value: feeAmount}("");
            if (!sent) revert FeeSendFailed();
            emit ProtocolFeeCollected(feeAmount);
        }
    }

    /**
     * @notice Adds liquidity for the bonding curve.
     * @param amount The ETH amount for liquidity.
     * @dev TODO: In the future, this function will integrate with Uniswap to create a liquidity pool,
     * add liquidity, and burn LP tokens to lock liquidity permanently.
     */
    function addLiquidity(uint256 amount) internal {
        uint256 tokenAmount = LP_SUPPLY;
        _mint(address(this), tokenAmount);
        emit LiquidityAdded(amount, tokenAmount);

        // TODO: Replace this placeholder code with Uniswap pool creation and LP token burning.
    }

    /**
     * @notice Estimates the tokens to be received for a given ETH amount.
     * @param ethAmount The ETH amount to spend.
     * @return tokensExpected The estimated number of tokens received.
     */
    function estimateBuy(uint256 ethAmount) external view returns (uint256 tokensExpected) {
        if (ethAmount == 0) revert NoETHSent();
        if (isCurveClosed) revert CurveClosed();

        uint256 protocolFee = (ethAmount * protocolFeePercentage) / 10000;
        uint256 amountPaid = ethAmount - protocolFee;
        uint256 S0 = totalSupply();
        uint256 S1 = BondingCurveLib.calculateS1Buy(S0, amountPaid, k);
        tokensExpected = S1 - S0;

        if (S1 >= TOKENS_FOR_SALE) tokensExpected = TOKENS_FOR_SALE - S0;
    }

    /**
     * @notice Estimates the ETH to be received for selling a given number of tokens.
     * @param tokensAmount Number of tokens to sell.
     * @return ethExpected The estimated ETH received.
     */
    function estimateSell(uint256 tokensAmount) external view returns (uint256 ethExpected) {
        if (tokensAmount == 0) revert NoTokens();
        if (isCurveClosed) revert CurveClosed();

        uint256 S0 = totalSupply();
        uint256 S1 = S0 - tokensAmount;
        uint256 grossRefund = BondingCurveLib.calculateSellRefund(S0, S1, k);

        uint256 protocolFee = (grossRefund * protocolFeePercentage) / 10000;
        uint256 netRefund = grossRefund - protocolFee;
        ethExpected = netRefund;
    }

    /**
     * @notice Receive function to accept ETH donations.
     * Fires a "ThankYouForYourDonation" event for tracking donations.
     */
    receive() external payable {
        if (isCurveClosed) revert CurveClosed();
        emit ThankYouForYourDonation(msg.sender);
    }

    /**
     * @notice Fallback function to accept ETH donations.
     * Fires a "ThankYouForYourDonation" event for tracking donations.
     */
    fallback() external payable {
        if (isCurveClosed) revert CurveClosed();
        emit ThankYouForYourDonation(msg.sender);
    }
}
