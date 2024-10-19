import { processEVMEvent } from '../services/evmService';
import { processSolanaEvent } from '../services/solanaService';
import { processSuiEvent } from '../services/suiService';

interface EventData {
    eventHash: string;
    network: string;
    contractAddress: string;
    tokenAddress: string;
    name: string;
    symbol: string;
    minter: string;
    chainIds: string;
}

const evmChainIds = new Set([
    1,          // Ethereum Mainnet
    2,          // Dummy Value for test
    11155111,   // Ethereum Sepolia
    137,        // Polygon Mainnet
    80002,      // Polygon Amoy Testnet
    42161,      // Arbitrum Mainnet
    421611,     // Arbitrum Testnet
    10,         // Optimism Mainnet
    69,         // Optimism Testnet
    31337,      // Anvil local
]);

async function processEventTask(eventData: EventData): Promise<any> {
    try {
        const networkType = getNetworkType(eventData.network);

        let result;
        switch (networkType) {
            case 'EVM':
                result = await processEVMEvent(eventData);
                break;
            case 'Solana':
                result = await processSolanaEvent(eventData);
                break;
            case 'SUI':
                result = await processSuiEvent(eventData);
                break;
            default:
                throw new Error(`Unsupported network type: ${networkType}`);
        }

        return `Event processed successfully: ${JSON.stringify(result)}`;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Error processing event` + JSON.stringify(eventData);
        console.error(`Error processing event:`, errorMessage);
        throw new Error(`Failed to process event: ${errorMessage}`);
    }
}

// Utility function to determine the network type
function getNetworkType(chainId: string): 'EVM' | 'Solana' | 'SUI' {
    const chainIdNumber = parseInt(chainId, 10); // Convert the chain ID to a number

    // Check if the chain ID belongs to an EVM network
    if (evmChainIds.has(chainIdNumber)) {
        return 'EVM';
    }

    // You can have specific Solana and SUI chain identifiers if needed
    if (chainId === 'solana-mainnet' || chainId === 'solana-testnet') {
        return 'Solana';
    } else if (chainId === 'sui-mainnet' || chainId === 'sui-testnet') {
        return 'SUI';
    }

    throw new Error(`Unknown network type for chain ID: ${chainId}`);
}

export default processEventTask;
