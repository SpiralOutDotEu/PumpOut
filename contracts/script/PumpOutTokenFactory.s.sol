// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PumpOutTokenFactory} from "../src/PumpOutTokenFactory.sol";

contract PumpOutTokenFactoryScript is Script {
    PumpOutTokenFactory public factory;

    // Define the parameters for deployment
    uint256[] public chainIds = [901]; // Example chain IDs: Solana
    uint256[] public prices = [0.01 ether]; // Example prices in wei
    uint256 public minFee = 0.001 ether; // Example minimum fee in wei

    function setUp() public {
        // Initialization or setup steps can be done here if needed
    }

    function run() public {
        // Start broadcasting (this sends transactions)
        vm.startBroadcast();

        // Deploy the PumpOutTokenFactory contract
        address initialOwner = msg.sender;
        address operatorMinter = msg.sender; // For the purpose of the script, use msg.sender
        address operatorOwner = msg.sender; // For the purpose of the script, use msg.sender

        factory = new PumpOutTokenFactory(initialOwner, operatorMinter, operatorOwner, chainIds, prices, minFee);

        // Log the deployed factory address
        console.log("PumpOutTokenFactory deployed at:", address(factory));

        // Define the parameters for the first PumpOutToken
        string memory name1 = "Sample Multi Token";
        string memory symbol1 = "SMTKN";
        uint256 availableSupply1 = 800_000_000; // Example available supply
        uint256 lpSupply1 = 200_000_000; // Example LP supply
        uint256 kValue1 = 69_000; // Bonding curve multiplier
        uint256 protocolFeePercentage1 = 100; // 1% fee in basis points
        address protocolFeeCollector1 = msg.sender; // For the script, use msg.sender

        // Deploy sample token 1
        uint256 requiredAmount = factory.getRequiredAmount(chainIds);

        address token1 = factory.createPumpOutToken{value: requiredAmount}(
            name1,
            symbol1,
            availableSupply1,
            lpSupply1,
            kValue1,
            protocolFeePercentage1,
            protocolFeeCollector1,
            chainIds
        );
        console.log("Token 1 deployed at address:", address(token1));

        // Define parameters for the second PumpOutToken
        string memory name2 = "Second Multi Token";
        string memory symbol2 = "S2MTKN";
        uint256 availableSupply2 = 1_000_000_000;
        uint256 lpSupply2 = 250_000_000;
        uint256 kValue2 = 70_000;
        uint256 protocolFeePercentage2 = 200; // 2% fee in basis points
        address protocolFeeCollector2 = msg.sender;

        // Deploy sample token 2
        uint256 requiredAmount2 = factory.getRequiredAmount(chainIds);

        address token2 = factory.createPumpOutToken{value: requiredAmount2}(
            name2,
            symbol2,
            availableSupply2,
            lpSupply2,
            kValue2,
            protocolFeePercentage2,
            protocolFeeCollector2,
            chainIds
        );
        console.log("Token 2 deployed at address:", address(token2));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
