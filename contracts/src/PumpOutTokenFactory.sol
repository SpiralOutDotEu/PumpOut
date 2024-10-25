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

    // Default parameters for PumpOutToken creation
    uint256 public availableSupply = 800_000_000; // Default available supply
    uint256 public lpSupply = 200_000_000; // Default LP supply
    uint256 public kValue = 69_000; // Default bonding curve multiplier
    uint256 public protocolFeePercentage = 100; // Default protocol fee in basis points (1%)
    address public protocolFeeCollector; // Address to collect protocol fees (deployer by default)

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
        protocolFeeCollector = initialOwner; // Set default protocol fee collector to the initial owner

        require(chainIds.length == prices.length, "Chain IDs and prices length mismatch");
        for (uint256 i = 0; i < chainIds.length; i++) {
            chainPrices[chainIds[i]] = prices[i];
        }
        minFee = _minFee;
    }

    // Functions to update the default parameters (only callable by the owner)
    function setAvailableSupply(uint256 _availableSupply) external onlyOwner {
        availableSupply = _availableSupply;
    }

    function setLpSupply(uint256 _lpSupply) external onlyOwner {
        lpSupply = _lpSupply;
    }

    function setKValue(uint256 _kValue) external onlyOwner {
        kValue = _kValue;
    }

    function setProtocolFeePercentage(uint256 _protocolFeePercentage) external onlyOwner {
        protocolFeePercentage = _protocolFeePercentage;
    }

    function setProtocolFeeCollector(address _protocolFeeCollector) external onlyOwner {
        protocolFeeCollector = _protocolFeeCollector;
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

    function createPumpOutToken(string memory name, string memory symbol, uint256[] memory chainIds)
        external
        payable
        returns (address)
    {
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
            kValue,
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
            kValue,
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
