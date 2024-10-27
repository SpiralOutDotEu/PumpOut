import { ethers } from 'ethers';
import { addChain } from '../services/nttCliService';
import "dotenv/config";
import { ADD_CHAIN_ID_MAP } from '../constants/constants';
import path from 'path';
import fs from 'fs';

// Path to the ABI file in the artifacts folder
const ABI_PATH = path.resolve(__dirname, '../artifacts/PumpOutTokenFactory.json');

// Load the ABI
const contractAbi = JSON.parse(fs.readFileSync(ABI_PATH, 'utf8'));

interface EVMEventData {
    chainId: string;
    projectPath: string;
    projectFile: string;
    network: string;
    contractAddress: string;
    tokenAddress: string;
    name: string;
    symbol: string;
    minter: string;
}

export async function processEVMEvent(eventData: EVMEventData): Promise<any> {
    try {
        const { chainId, projectPath, projectFile, name, symbol, minter, tokenAddress } = eventData;

        // Step 1: Get the RPC URL, Contract Address, and Private Key from environment variables
        const rpcUrl = process.env[`${chainId}_RPC_URL`];
        const contractAddress = process.env[`${chainId}_CONTRACT_ADDRESS`];
        const privateKey = process.env[`ETH_PRIVATE_KEY`];  // Use a private key for signing

        if (!rpcUrl || !contractAddress || !privateKey) {
            throw new Error(`Missing RPC URL, Contract Address, or Private Key for chain ID: ${chainId}`);
        }

        // Step 2: Initialize ethers provider and wallet
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Step 3: Create a contract object using ABI and contract address
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, wallet);

        // Step 4: Estimate gas and send the transaction
        // createPeerToken(string memory name, string memory symbol, uint256 parentChain, address parentToken)
        const gasEstimate = await contract.createPeerToken.estimateGas(
            name, symbol, parseInt(chainId), tokenAddress
        );

        const tx = await contract.createPeerToken(
            name, symbol, parseInt(chainId), tokenAddress,
            {
                gasLimit: gasEstimate,
                gasPrice: (await provider.getFeeData()).gasPrice,
            }
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Retrieve the token address from the emitted event
        const createdTokenAddress = receipt.logs[1].args[0];
        const creationHash = receipt.hash;
        console.log("Transaction Hash (creationHash): ", creationHash);
        console.log("Created Token Address (createdTokenAddress): ", createdTokenAddress);

        // Ensure the createdTokenAddress is valid
        if (!createdTokenAddress) {
            throw new Error(`Failed to retrieve a valid token address from the transaction on chain ${chainId}`);
        }

        console.log(`Peer token created on chain ${chainId}: ${createdTokenAddress}`);

        // Step 5: Use the centralized addChain function from nttCliService
        const chainString = ADD_CHAIN_ID_MAP[`${chainId}`];  // Convert chain ID to a string and look up in the map
        if (!chainString) {
            throw new Error(`Chain ID ${chainId} not mapped to a known network`);
        }

        // Call addChain with detailed logging
        await addChain(chainString, projectFile, projectPath, createdTokenAddress);

        return {
            success: true,
            message: `EVM event processed successfully on chain ${chainId}`,
            data: {
                createdTokenAddress,
                chainId,
                creationHash,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Unknown error processing EVM event for chain ${eventData.chainId}:`;
        console.error(`Error processing EVM event for chain ${eventData.chainId}:`, error);
        throw new Error(`Failed to process EVM event: ${errorMessage}`);
    }
}
