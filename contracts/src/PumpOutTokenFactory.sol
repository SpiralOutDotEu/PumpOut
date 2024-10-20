// SPDX-License-Identifier: Apache 2
pragma solidity >=0.6.12 <0.9.0;

import "./PumpOutToken.sol";
import "./PeerToken.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract PumpOutTokenFactory is Ownable {
    event PumpOutTokenCreated(
        address indexed tokenAddress, string name, string symbol, address minter, uint256[] chainIds
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

    mapping(uint256 => uint256) public chainPrices; // chainId => price in wei
    uint256 public minFee;

    constructor(address initialOwner, uint256[] memory chainIds, uint256[] memory prices, uint256 _minFee)
        Ownable(initialOwner)
    {
        require(chainIds.length == prices.length, "Chain IDs and prices length mismatch");
        for (uint256 i = 0; i < chainIds.length; i++) {
            chainPrices[chainIds[i]] = prices[i];
        }
        minFee = _minFee;
    }

    function setChainPrice(uint256 chainId, uint256 price) external onlyOwner {
        chainPrices[chainId] = price;
    }

    function setMinFee(uint256 _minFee) external onlyOwner {
        minFee = _minFee;
    }

    function getRequiredAmount(uint256[] memory chainIds) public view returns (uint256 totalAmount) {
        totalAmount = minFee;
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (chainPrices[chainIds[i]] == 0) {
                revert UnsuportedChain();
            }
            totalAmount += chainPrices[chainIds[i]];
        }
    }

    function createPumpOutToken(
        string memory name,
        string memory symbol,
        address minter,
        address owner,
        uint256[] memory chainIds
    ) external payable onlyOwner returns (address) {
        uint256 requiredAmount = getRequiredAmount(chainIds);
        if (msg.value < requiredAmount) {
            revert InsufficientPayment();
        }

        PumpOutToken newToken = new PumpOutToken(name, symbol, minter, owner);

        emit PumpOutTokenCreated(address(newToken), name, symbol, minter, chainIds);

        return address(newToken);
    }

    function createPeerToken(
        string memory name,
        string memory symbol,
        address minter,
        address owner,
        uint256 parentChain,
        address parentToken
    ) external onlyOwner returns (address) {
        PeerToken newToken = new PeerToken(name, symbol, minter, owner);

        emit PeerTokenCreated(address(newToken), name, symbol, minter, parentChain, parentToken);

        return address(newToken);
    }

    function withdrawEarnings() external onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
