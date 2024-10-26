// SPDX-License-Identifier: Apache 2
pragma solidity >=0.8.1 <0.9.0;

/**
 * @title BondingCurveLib
 * @dev Library for bonding curve calculations used in PumpOutToken.
 */
library BondingCurveLib {
    uint8 public constant DECIMALS = 18;
    uint256 private constant SCALE = 10 ** DECIMALS;
    uint256 public constant SCALE_SQUARED = SCALE * SCALE;

    /**
     * @notice Calculate S1 during a buy operation using a bonding curve.
     * @param S0 The current supply.
     * @param amountPaid The amount of ETH paid.
     * @param k The bonding curve multiplier constant.
     * @return S1 The new supply after purchase.
     */
    function calculateS1Buy(uint256 S0, uint256 amountPaid, uint256 k) external pure returns (uint256) {
        uint256 S0_squared = S0 * S0;
        uint256 delta = (amountPaid * SCALE_SQUARED) / (2 * k);
        uint256 S1_squared = S0_squared + delta;
        return sqrt(S1_squared);
    }

    /**
     * @notice Calculate the amount paid between S0 and S1.
     * @param S0 The starting supply.
     * @param S1 The ending supply.
     * @param k The bonding curve multiplier constant.
     * @return amountPaid The amount of ETH required to go from S0 to S1.
     */
    function calculateAmountPaid(uint256 S0, uint256 S1, uint256 k) external pure returns (uint256) {
        uint256 numerator = k * ((S1 * S1) - (S0 * S0));
        uint256 amountPaid = numerator * 2 / SCALE_SQUARED;
        return amountPaid;
    }

    /**
     * @notice Calculate the refund during a sell operation using a bonding curve.
     * @param S0 The current supply.
     * @param S1 The new supply after sale.
     * @param k The bonding curve multiplier constant.
     * @return amountRefund The amount of ETH to refund.
     */
    function calculateSellRefund(uint256 S0, uint256 S1, uint256 k) external pure returns (uint256) {
        uint256 numerator = k * ((S0 * S0) - (S1 * S1));
        uint256 amountRefund = numerator * 2 / SCALE_SQUARED;
        return amountRefund;
    }

    /**
     * @notice Calculate the square root of a given number using algorithm from ABDKMath64x64.
     * @param x The input number.
     * @return The square root of the input number as a uint256.
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
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
}
