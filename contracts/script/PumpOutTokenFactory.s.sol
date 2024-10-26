// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PumpOutTokenFactory} from "../src/PumpOutTokenFactory.sol";
import {TokenDeployer } from "../src/TokenDeployer.sol";

contract PumpOutTokenFactoryScript is Script {
    PumpOutTokenFactory public factory;
    TokenDeployer public tokenDeployer;

    // Define the parameters for deployment
    uint256[] public chainIds = [421614, 901]; // Example chain IDs: Arbitrum Sepolia, Solana dev
    uint256[] public prices = [0.0000001 ether, 0.0000001 ether]; // Example prices in wei
    uint256 public minFee = 0.0000001 ether; // Example minimum fee in wei

    function setUp() public {
        // Initialization or setup steps can be done here if needed
    }

    function run() public {
        // Start broadcasting (this sends transactions)
        vm.startBroadcast();

        // Deploy Token Deployer
        tokenDeployer = new TokenDeployer();
        // Deploy the PumpOutTokenFactory contract
        address initialOwner = msg.sender;
        address operatorMinter = msg.sender; // Use msg.sender for simplicity in the script
        address operatorOwner = msg.sender; // Use msg.sender for simplicity in the script

        factory = new PumpOutTokenFactory(initialOwner, operatorMinter, operatorOwner, chainIds, prices, minFee, address(tokenDeployer));

        // Log the deployed factory address
        console.log("PumpOutTokenFactory deployed at:", address(factory));

        // Define the token names and symbols for the tokens to be created
        string memory name1 = "Sample Multi Token";
        string memory symbol1 = "SMTKN";

        // Deploy the first token using the default parameters in the factory
        uint256 requiredAmount = factory.getRequiredAmount(chainIds);
        address token1 = factory.createPumpOutToken{value: requiredAmount}(name1, symbol1, chainIds);
        console.log("Token 1 deployed at address:", address(token1));

        // Define parameters for the second token
        string memory name2 = "Second Multi Token";
        string memory symbol2 = "S2MTKN";

        // Deploy the second token using the default parameters in the factory
        uint256 requiredAmount2 = factory.getRequiredAmount(chainIds);
        address token2 = factory.createPumpOutToken{value: requiredAmount2}(name2, symbol2, chainIds);
        console.log("Token 2 deployed at address:", address(token2));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
