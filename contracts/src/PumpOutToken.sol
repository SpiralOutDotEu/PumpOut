// SPDX-License-Identifier: Apache 2
pragma solidity >=0.6.12 <0.9.0;

import "./PeerToken.sol";

contract PumpOutToken is PeerToken {
    // Events
    event LiquidityAdded(uint256 ethAmount, uint256 tokenAmount);
    event ProtocolFeeCollected(uint256 amount);
    event ThankYouForYourDonation(address sender);

    // Constants for the bonding curve
    uint256 public TOKENS_FOR_SALE;
    uint256 public LP_SUPPLY;
    uint256 public k; // constant for bonding curve multiplier
    uint256 public MAX_SUPPLY;

    // Calculate square scaling factor 1e36
    uint8 public constant DECIMALS = 18; // Token decimals
    uint256 private constant SCALE = 10 ** DECIMALS; // Scaling factor for calculations
    uint256 public constant SCALE_SQUARED = SCALE * SCALE; // Squared scaling factor for quadratic calculations

    // Protocol fee percentage (in basis points, e.g., 100 = 1%)
    uint256 public protocolFeePercentage = 100; // 1% fee by default
    // Address to collect protocol fees
    address private protocolFeeCollector;

    // State variables
    bool public isCurveClosed = false;

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
        TOKENS_FOR_SALE = _availableSupply * 10 ** 18; // Tokens under bonding curve
        LP_SUPPLY = _lpSupply * 10 ** 18; // Tokens for bootstraping LP
        k = _k; // k factor
        protocolFeePercentage = _protocolFeePercentage; // Protocol fee percentage (in basis points, e.g., 100 = 1%)
        protocolFeeCollector = _protocolFeeCollector; // Address to collect protocol fees
        MAX_SUPPLY = TOKENS_FOR_SALE + LP_SUPPLY; // Total token supply
    }

    /**
     * @notice Return the remaining tokens available for sale.
     * @return remainingTokens The number of tokens still available for sale.
     */
    function remainingTokensForSale() public view returns (uint256 remainingTokens) {
        if (isCurveClosed) {
            return 0; // If the curve is closed, no tokens are available for sale.
        }

        uint256 S0 = totalSupply();
        remainingTokens = TOKENS_FOR_SALE - S0;
    }

    /**
     * @notice Return the amount of ETH required to buy the remaining available tokens.
     * @return ethRequired The amount of ETH required to buy all remaining tokens.
     */
    function ethRequiredToBuyRemainingTokens() public view returns (uint256 ethRequired) {
        if (isCurveClosed) {
            return 0; // If the curve is closed, no more tokens can be bought.
        }

        uint256 S0 = totalSupply();
        uint256 S1 = TOKENS_FOR_SALE; // Target to mint all remaining tokens

        ethRequired = _calculateAmountPaid(S0, S1);
        // Adjust for protocol fee
        ethRequired = (ethRequired * 10000) / (10000 - protocolFeePercentage);
    }

    /**
     * @notice Buy tokens with ETH, specifying the minimum tokens expected to protect against slippage.
     * @param minTokens The minimum number of tokens the buyer expects to receive.
     */
    function buy(uint256 minTokens) external payable {
        require(!isCurveClosed, "Bonding curve is closed");
        require(msg.value > 0, "Must send ETH to buy tokens");

        uint256 initialProtocolFee = (msg.value * protocolFeePercentage) / 10000;
        uint256 amountPaid = msg.value - initialProtocolFee;

        uint256 S0 = totalSupply();

        uint256 S1 = _calculateS1Buy(S0, amountPaid);
        uint256 tokensToMint = S1 - S0;

        // Ensure the tokens to mint meet the minimum expectation
        require(tokensToMint >= minTokens, "Slippage: Not enough tokens received");

        if (S1 >= TOKENS_FOR_SALE) {
            S1 = TOKENS_FOR_SALE;
            tokensToMint = TOKENS_FOR_SALE - S0;

            amountPaid = _calculateAmountPaid(S0, S1);
            // Protocol fee remains based on original msg.value
            uint256 protocolFee = initialProtocolFee;

            uint256 refund = msg.value - amountPaid - protocolFee;
            if (refund > 0) {
                payable(msg.sender).transfer(refund);
            }

            isCurveClosed = true;

            addLiquidity(address(this).balance - protocolFee);
        }
        _transferProtocolFee(initialProtocolFee);

        // Mint tokens to buyer
        _mint(msg.sender, tokensToMint);
    }

    /**
     * @notice Sell tokens for ETH, specifying the minimum ETH expected to protect against slippage.
     * @param tokensToSell The number of tokens the user wants to sell.
     * @param minETH The minimum amount of ETH the user expects to receive.
     */
    function sell(uint256 tokensToSell, uint256 minETH) external {
        require(!isCurveClosed, "Bonding curve is closed");
        require(balanceOf(msg.sender) >= tokensToSell, "Not enough tokens to sell");
        require(tokensToSell > 0, "Must sell a positive amount of tokens");

        uint256 S0 = totalSupply();
        uint256 S1 = S0 - tokensToSell;

        // Calculate refund amount before protocol fee
        uint256 grossRefund = _calculateSellRefund(S0, S1);

        // Calculate protocol fee on the refund
        uint256 protocolFee = (grossRefund * protocolFeePercentage) / 10000;
        uint256 netRefund = grossRefund - protocolFee;

        // Ensure the net refund meets the minimum expectation
        require(netRefund >= minETH, "Slippage: Not enough ETH received");

        // Burn the tokens being sold
        _burn(msg.sender, tokensToSell);

        // Transfer Protocol Fee
        _transferProtocolFee(protocolFee);

        // Transfer ETH to seller
        (bool sent,) = msg.sender.call{value: netRefund}("");
        require(sent, "Failed to send Ether");
    }

    // Internal function to handle protocol fee transfers
    function _transferProtocolFee(uint256 feeAmount) internal {
        if (feeAmount > 0) {
            (bool sent,) = protocolFeeCollector.call{value: feeAmount}("");
            require(sent, "Failed to send Ether to protocol fee");
            emit ProtocolFeeCollected(feeAmount);
        }
    }

    // Function to add liquidity (now emits correct event with amounts)
    function addLiquidity(uint256 amount) internal {
        uint256 tokenAmount = LP_SUPPLY;

        // Mint LP tokens
        _mint(address(this), tokenAmount);

        // Emit event with correct amounts
        emit LiquidityAdded(amount, tokenAmount);

        // Here we should interact with Uniswap to add liquidity
        // For now, we're just emitting the event
    }

    // Internal function to calculate S1 during buy
    function _calculateS1Buy(uint256 S0, uint256 amountPaid) internal view returns (uint256) {
        uint256 S0_squared = S0 * S0;
        uint256 delta = (amountPaid * SCALE_SQUARED) / (2 * k);
        uint256 S1_squared = S0_squared + delta;
        uint256 S1 = sqrt(S1_squared);
        return S1;
    }

    // Internal function to calculate amountPaid between S0 and S1
    function _calculateAmountPaid(uint256 S0, uint256 S1) internal view returns (uint256) {
        uint256 numerator = k * ((S1 * S1) - (S0 * S0));
        uint256 amountPaid = numerator * 2 / (SCALE_SQUARED);
        return amountPaid;
    }

    // Internal function to calculate refund during sell
    function _calculateSellRefund(uint256 S0, uint256 S1) internal view returns (uint256) {
        uint256 numerator = k * ((S0 * S0) - (S1 * S1));
        uint256 amountRefund = numerator * 2 / (SCALE_SQUARED);
        return amountRefund;
    }

    // Square root function using the Fast Integer Square Root Algorithm (ABDKMath64x64)
    function sqrt(uint256 x) internal pure returns (uint256 z) {
        unchecked {
            if (x == 0) {
                return 0;
            } else {
                uint256 xx = x;
                uint256 r = 1;
                if (xx >= 0x100000000000000000000000000000000) {
                    xx >>= 128;
                    r <<= 64;
                }
                if (xx >= 0x10000000000000000) {
                    xx >>= 64;
                    r <<= 32;
                }
                if (xx >= 0x100000000) {
                    xx >>= 32;
                    r <<= 16;
                }
                if (xx >= 0x10000) {
                    xx >>= 16;
                    r <<= 8;
                }
                if (xx >= 0x100) {
                    xx >>= 8;
                    r <<= 4;
                }
                if (xx >= 0x10) {
                    xx >>= 4;
                    r <<= 2;
                }
                if (xx >= 0x4) r <<= 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                r = (r + x / r) >> 1;
                uint256 r1 = x / r;
                return (r < r1 ? r : r1);
            }
        }
    }

    /**
     * @notice Estimate the number of tokens received for a given ETH amount.
     * @param ethAmount The amount of ETH to spend on buying tokens.
     * @return tokensExpected The estimated number of tokens to be received.
     */
    function estimateBuy(uint256 ethAmount) external view returns (uint256 tokensExpected) {
        require(ethAmount > 0, "ETH amount must be greater than 0");
        require(!isCurveClosed, "Bonding curve is closed");

        uint256 protocolFee = (ethAmount * protocolFeePercentage) / 10000;
        uint256 amountPaid = ethAmount - protocolFee;

        uint256 S0 = totalSupply();
        uint256 S1 = _calculateS1Buy(S0, amountPaid);
        tokensExpected = S1 - S0;

        // If purchase would exceed TOKENS_FOR_SALE, adjust the expected tokens
        if (S1 >= TOKENS_FOR_SALE) {
            tokensExpected = TOKENS_FOR_SALE - S0;
        }
    }

    /**
     * @notice Estimate the amount of ETH received for selling a given number of tokens.
     * @param tokensAmount The number of tokens to sell.
     * @return ethExpected The estimated amount of ETH to be received.
     */
    function estimateSell(uint256 tokensAmount) external view returns (uint256 ethExpected) {
        require(tokensAmount > 0, "Token amount must be greater than 0");
        require(!isCurveClosed, "Bonding curve is closed");

        uint256 S0 = totalSupply();
        uint256 S1 = S0 - tokensAmount;

        // Calculate gross refund before protocol fee
        uint256 grossRefund = _calculateSellRefund(S0, S1);

        // Calculate protocol fee on the refund
        uint256 protocolFee = (grossRefund * protocolFeePercentage) / 10000;
        uint256 netRefund = grossRefund - protocolFee;

        ethExpected = netRefund;
    }

    function _maxSupply() internal view override returns (uint256) {
        return MAX_SUPPLY;
    }

    // Fallback and receive functions to accept ETH
    receive() external payable {
        require(!isCurveClosed);
        emit ThankYouForYourDonation(msg.sender);
    }

    fallback() external payable {
        require(!isCurveClosed);
        emit ThankYouForYourDonation(msg.sender);
    }
}
