import { processEVMEvent } from '../services/evmService';
import { processSolanaEvent } from '../services/solanaService';
import { processSuiEvent } from '../services/suiService';  // Import SUI processing
import { createProject } from '../services/nttCliService';

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
        const projectPath = await createProject(eventData.network, eventData.tokenAddress);
        console.log(`Project created at: ${projectPath}`);

        // Step 2: Process each chain ID with the created project path
        for (const chainId of eventData.chainIds) {
            console.log(`Processing chain ID: ${chainId}`);

            // Step 3: Determine the network type and process accordingly
            const networkType = getNetworkType(chainId);

            let result;
            switch (networkType) {
                case 'EVM':
                    result = await processEVMEvent({ ...eventData, chainId, projectPath });
                    break;
                case 'Solana':
                    result = await processSolanaEvent({ ...eventData, chainId, projectPath });
                    break;
                case 'SUI':
                    result = await processSuiEvent({ ...eventData, chainId, projectPath });
                    break;
                default:
                    throw new Error(`Unsupported network type for chain ID: ${chainId}`);
            }

            console.log(`Event processed for chain ID ${chainId}: ${JSON.stringify(result)}`);
        }

        return `All chains processed successfully for event: ${eventData.tokenAddress}`;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Error processing event`;
        console.error(`Error processing event:`, errorMessage);
        throw new Error(`Failed to process event: ${errorMessage}`);
    }
}

// Utility function to determine the network type based on chain ID
function getNetworkType(chainId: string): 'EVM' | 'Solana' | 'SUI' {
    const evmChainIds = new Set([1, 2, 3, 4, 5, 42, 137, 80001, 42161, 421611, 10, 69]);

    const chainIdNumber = parseInt(chainId, 10);

    // Check if the chain ID belongs to an EVM network
    if (evmChainIds.has(chainIdNumber)) {
        return 'EVM';
    }

    // Handle Solana (assuming chain ID 999999 is for Solana)
    if (chainId === '999999') {
        return 'Solana';
    }

    // Handle SUI (assuming chain ID 888888 is for SUI)
    if (chainId === '888888') {
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