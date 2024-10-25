// SPDX-License-Identifier: Apache 2
pragma solidity >=0.6.12 <0.9.0;

import "./PumpOutToken.sol";
import "./PeerToken.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract PumpOutTokenFactory is Ownable {
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

    mapping(uint256 => uint256) public chainPrices; // chainId => price in wei
    uint256 public minFee;

    address public operatorMinter;
    address public operatorOwner;

    constructor(
        address initialOwner,
        address _operatorMinter,
        address _operatorOwner,
        uint256[] memory chainIds,
        uint256[] memory prices,
        uint256 _minFee
    ) Ownable(initialOwner) {
        operatorMinter = _operatorMinter;
        operatorOwner = _operatorOwner;

        require(chainIds.length == prices.length, "Chain IDs and prices length mismatch");
        for (uint256 i = 0; i < chainIds.length; i++) {
            chainPrices[chainIds[i]] = prices[i];
        }
        minFee = _minFee;
    }

    function setOperatorMinter(address _operatorMinter) external onlyOwner {
        operatorMinter = _operatorMinter;
    }

    function setOperatorOwner(address _operatorOwner) external onlyOwner {
        operatorOwner = _operatorOwner;
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
        uint256 availableSupply,
        uint256 lpSupply,
        uint256 k,
        uint256 protocolFeePercentage,
        address protocolFeeCollector,
        uint256[] memory chainIds
    ) external payable onlyOwner returns (address) {
        uint256 requiredAmount = getRequiredAmount(chainIds);
        if (msg.value < requiredAmount) {
            revert InsufficientPayment();
        }

        PumpOutToken newToken = new PumpOutToken(
            name,
            symbol,
            operatorMinter,
            operatorOwner,
            availableSupply,
            lpSupply,
            k,
            protocolFeePercentage,
            protocolFeeCollector
        );

        emit PumpOutTokenCreated(
            address(newToken),
            name,
            symbol,
            operatorMinter,
            availableSupply,
            lpSupply,
            k,
            protocolFeePercentage,
            protocolFeeCollector,
            chainIds
        );

        return address(newToken);
    }

    function createPeerToken(string memory name, string memory symbol, uint256 parentChain, address parentToken)
        external
        onlyOwner
        returns (address)
    {
        PeerToken newToken = new PeerToken(name, symbol, operatorMinter, operatorOwner);

        emit PeerTokenCreated(address(newToken), name, symbol, operatorMinter, parentChain, parentToken);

        return address(newToken);
    }

    function withdrawEarnings() external onlyOwner {
        (bool success,) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
