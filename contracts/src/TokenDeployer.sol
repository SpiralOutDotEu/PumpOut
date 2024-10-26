// SPDX-License-Identifier: Apache 2
pragma solidity >=0.6.12 <0.9.0;

import "./PumpOutToken.sol";
import "./PeerToken.sol";

contract TokenDeployer {
    /**
     * @notice Deploys a new instance of PumpOutToken.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param minter The address allowed to mint tokens.
     * @param owner The address designated as the owner of the contract.
     * @param availableSupply The available supply of tokens for sale.
     * @param lpSupply The amount of tokens reserved for liquidity provision.
     * @param k The bonding curve multiplier constant.
     * @param protocolFeePercentage The protocol fee as a percentage in basis points (e.g., 100 = 1%).
     * @param protocolFeeCollector The address that will collect the protocol fees.
     * @return The address of the newly deployed PumpOutToken contract.
     */
    function deployPumpOutToken(
        string memory name,
        string memory symbol,
        address minter,
        address owner,
        uint256 availableSupply,
        uint256 lpSupply,
        uint256 k,
        uint256 protocolFeePercentage,
        address protocolFeeCollector
    ) external returns (address) {
        PumpOutToken newToken = new PumpOutToken(
            name, symbol, minter, owner, availableSupply, lpSupply, k, protocolFeePercentage, protocolFeeCollector
        );
        return address(newToken);
    }

    /**
     * @notice Deploys a new instance of PeerToken.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param minter The address allowed to mint tokens.
     * @param owner The address designated as the owner of the contract.
     * @return The address of the newly deployed PeerToken contract.
     */
    function deployPeerToken(string memory name, string memory symbol, address minter, address owner)
        external
        returns (address)
    {
        PeerToken newToken = new PeerToken(name, symbol, minter, owner);
        return address(newToken);
    }
}
