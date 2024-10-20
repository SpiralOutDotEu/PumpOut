import Web3 from 'web3';
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

        // Step 1: Get the RPC URL and Contract Address from environment variables
        const rpcUrl = process.env[`${chainId}_RPC_URL`];
        const contractAddress = process.env[`${chainId}_CONTRACT_ADDRESS`];

        if (!rpcUrl || !contractAddress) {
            throw new Error(`Missing RPC URL or Contract Address for chain ID: ${chainId}`);
        }

        // Step 2: Initialize web3 with the RPC URL
        const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

        const contract = new web3.eth.Contract(contractAbi.abi, contractAddress);

        // Step 3: Prepare the transaction
        const accounts = await web3.eth.getAccounts();
        const owner = accounts[0];  // The first account is used as the owner

        // Call the `createPeerToken` method and wait for the result
        const tx = await contract.methods
            .createPeerToken(name, symbol, minter, owner, parseInt(chainId), tokenAddress)
            .send({ from: owner });

        // Assuming the token address is returned in the transaction receipt
        const createdTokenAddress = tx.events?.TokenCreated?.returnValues?.tokenAddress; // || tx.contractAddress;

        // Ensure the createdTokenAddress is a valid string
        if (!createdTokenAddress || typeof createdTokenAddress !== 'string') {
            throw new Error(`Failed to retrieve a valid token address from the transaction on chain ${chainId}`);
        }

        console.log(`Peer token created on chain ${chainId}: ${createdTokenAddress}`);

        // Step 4: Use the centralized addChain function from nttCliService
        const chainString = ADD_CHAIN_ID_MAP[chainId];  // Convert chain ID to string representation
        if (!chainString) {
            throw new Error(`Chain ID ${chainId} not mapped to a known network`);
        }

        await addChain(chainString, projectFile, projectPath, createdTokenAddress);

        return {
            success: true,
            message: `EVM event processed successfully on chain ${chainId}`,
            data: {
                createdTokenAddress,
                chainId,
                projectPath,
                projectFile,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Unknown error processing EVM event for chain ${eventData.chainId}:`;
        console.error(`Error processing EVM event for chain ${eventData.chainId}:`, error);
        throw new Error(`Failed to process EVM event: ${errorMessage}`);
    }
}
