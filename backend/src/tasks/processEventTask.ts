import { processEVMEvent } from '../services/evmService';
import { processSolanaEvent } from '../services/solanaService';
import { processSuiEvent } from '../services/suiService';
import { addChain, createProject } from '../services/nttCliService';
import { ADD_CHAIN_ID_MAP } from '../constants/constants';
import { updateLimits } from '../services/limitUpdaterService';
import * as fs from 'fs';
import * as path from 'path';

interface EventData {
    network: string;
    contractAddress: string;
    tokenAddress: string;
    name: string;
    symbol: string;
    minter: string;
    chainIds: string[];
}

async function processEventTask(eventData: EventData): Promise<any> {
    try {
        // Validate the event data
        if (!validateEventData(eventData)) {
            throw new Error("Invalid event data");
        }

        // Step 1: Create a project once for this event (before processing any chain ID)
        const { basePath, projectName } = await createProject(eventData.network, eventData.tokenAddress);
        console.log(`Project created with base path: ${basePath} and project name: ${projectName}`);

        // Map network id to string
        const chainString = ADD_CHAIN_ID_MAP[`${eventData.network}`];  // Convert chain ID to a string and look up in the map
        if (!chainString) {
            throw new Error(`Chain ID ${eventData.network} not mapped to a known network`);
        }

        // Step 2: Run the NTT CLI add-chain for the network that triggered this event
        await addChain(chainString, projectName, basePath, eventData.tokenAddress);
        console.log(`Chain added for the network: ${eventData.network}`);

        // Step 3: Process each chain ID with the created project path
        for (const chainId of eventData.chainIds) {
            console.log(`Processing chain ID: ${chainId}`);

            // Step 3: Determine the network type and process accordingly
            const networkType = getNetworkType(chainId);

            let result;
            switch (networkType) {
                case 'EVM':
                    result = await processEVMEvent({
                        ...eventData,
                        chainId,
                        projectPath: basePath,
                        projectFile: projectName
                    });
                    break;
                case 'Solana':
                    result = await processSolanaEvent({
                        ...eventData,
                        chainId,
                        projectPath: basePath,
                        projectFile: projectName
                    });
                    break;
                case 'SUI':
                    result = await processSuiEvent({
                        ...eventData,
                        chainId,
                        projectPath: basePath,
                        projectFile: projectName
                    });
                    break;
                default:
                    throw new Error(`Unsupported network type for chain ID: ${chainId}`);
            }

            console.log(`Event processed for chain ID ${chainId}: ${JSON.stringify(result)}`);
        }

        // Step 4: Update the limits in the project file at basePath
        const projectFilePath = path.join(basePath, `${projectName}.json`);

        // Read the current project data from file
        const projectData = JSON.parse(fs.readFileSync(projectFilePath, 'utf8'));

        // Update the limits using the updateLimits service
        const updatedProjectData = updateLimits(projectData);

        // Write the updated project data back to the same file
        fs.writeFileSync(projectFilePath, JSON.stringify(updatedProjectData, null, 2), 'utf8');
        console.log(`Updated limits written to project file at ${projectFilePath}`);

        return `All chains processed successfully for event: ${eventData.tokenAddress}`;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Error processing event`;
        console.error(`Error processing event:`, errorMessage);
        throw new Error(`Failed to process event: ${errorMessage}`);
    }
}

// Utility function to determine the network type based on chain ID
function getNetworkType(chainId: string): 'EVM' | 'Solana' | 'SUI' {
    const evmChainIds = new Set([1, 2, 3, 4, 5, 42, 137, 80001, 42161, 421611, 10, 69, 11155111, 421614, 84532]);

    const chainIdNumber = parseInt(chainId, 10);

    // Check if the chain ID belongs to an EVM network
    if (evmChainIds.has(chainIdNumber)) {
        return 'EVM';
    }

    // Handle Solana (assuming chain ID 999999 is for Solana)
    if (chainId === '901') {
        return 'Solana';
    }

    // Handle SUI (assuming chain ID 888888 is for SUI)
    if (chainId === '101') {
        return 'SUI';
    }

    throw new Error(`Unknown network type for chain ID: ${chainId}`);
}

// TODO: Add validation function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateEventData(_eventData: EventData): boolean {
    // Add validation logic here
    return true;
}

export default processEventTask;
