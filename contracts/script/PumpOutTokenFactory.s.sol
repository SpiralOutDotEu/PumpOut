// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PumpOutTokenFactory} from "../src/PumpOutTokenFactory.sol";

contract PumpOutTokenFactoryScript is Script {
    PumpOutTokenFactory public factory;

    // Define the parameters for deployment
    uint256[] public chainIds = [1, 2, 137]; // Example chain ids: Ethereum, BSC, Polygon
    uint256[] public prices = [0.01 ether, 0.005 ether, 0.002 ether]; // Example prices in wei
    uint256 public minFee = 0.001 ether; // Example minimum fee in wei

    function setUp() public {
        // Initialization or setup steps can be done here if needed
    }

    function run() public {
        // Start broadcasting (this sends transactions)
        vm.startBroadcast();

        // Deploy the PumpOutTokenFactory contract
        factory = new PumpOutTokenFactory(msg.sender, chainIds, prices, minFee);

        // Log the deployed factory address
        console.log("PumpOutTokenFactory deployed at:", address(factory));

        // Deploy sample token 1
        uint256[] memory chains = new uint256[](2);
        chains[0] = 1;
        chains[1] = 2;
        uint256 requiredAmount = factory.getRequiredAmount(chains);
        address token = factory.createPumpOutToken{value: requiredAmount}("sample token", "STKN", msg.sender, msg.sender, chains);
        console.log("token address: ", address(token));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
