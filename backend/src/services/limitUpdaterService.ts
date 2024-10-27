interface ChainData {
    version: string;
    mode: string;
    paused: boolean;
    owner: string;
    manager: string;
    token: string;
    transceivers: any;
    limits: {
        outbound: string;
        inbound: { [key: string]: string };
    };
    pauser?: string;
}

interface InputData {
    network: string;
    chains: {
        [key: string]: ChainData;
    };
}

// Function to check if a chain is Solana
function isSolanaChain(chainName: string): boolean {
    return chainName.toLowerCase() === 'solana';
}

// Function to check if a chain is SUI (for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isSUIChain(_chainName: string): boolean {
    // Placeholder for future implementation
    return false;
}

/**
 * Updates the limits in the input data based on chain types.
 *
 * @param inputData The input data object containing chain information.
 * @returns The updated input data with modified limits.
 */
export function updateLimits(inputData: InputData): InputData {
    const chainNames = Object.keys(inputData.chains);

    chainNames.forEach((chainName) => {
        const chainData = inputData.chains[chainName];

        // Initialize inbound limits if not present
        if (!chainData.limits.inbound) {
            chainData.limits.inbound = {};
        }

        const isSolana = isSolanaChain(chainName);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isSUI = isSUIChain(chainName); // Placeholder for future

        // Update outbound limit
        if (isSolana) {
            chainData.limits.outbound = '999999990.100000000';
        } else {
            chainData.limits.outbound = '184467440737.095516150000000000';
        }

        // Update inbound limits from other chains
        chainNames.forEach((otherChainName) => {
            if (otherChainName === chainName) return; // Skip self

            let inboundLimit = '';

            if (isSolana) {
                // Solana inbound limits from other chains
                inboundLimit = '999999990.100000000';
            } else {
                // EVM chain inbound limits
                inboundLimit = '999999990.095516150000000000';
            }

            // Assign inbound limit
            chainData.limits.inbound[otherChainName] = inboundLimit;
        });
    });

    return inputData;
}
