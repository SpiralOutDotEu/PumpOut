/* eslint-disable @typescript-eslint/no-explicit-any */
import { NttData } from '../types/nttData';
import { database } from '../lib/db';

export async function addNewNttFileService(data: NttData): Promise<Record<string, unknown>> {
    const { projectData, network, tokenAddress } = data;
    const chains = Object.keys(projectData.chains);

    // Fetch token details from the database
    const token = await database.getTokenByAddress(network, tokenAddress);

    if (!token) {
        throw new Error(`Token not found in database for network ${network} and address ${tokenAddress}`);
    }

    const tokenSymbol = token.symbol;
    const tokenName = token.name;
    const tokenLogo = token.logo; // May be undefined

    // Build tokensConfig with unique keys for each network
    const tokensConfig = buildTokensConfig(projectData.chains, tokenSymbol, tokenName, tokenLogo);

    // Define the NTT group name using token symbol and NTT suffix
    const nttGroupName = `${tokenSymbol}_NTT`;

    // Construct the main configuration JSON structure
    const config = {
        env: projectData.network.toLowerCase(), // Assuming network is uppercase in the projectData
        networks: chains.map(chain => chain.toLowerCase()), // List of chain names in lowercase
        bridgeDefaults: {
            fromNetwork: chains[0].toLowerCase() || 'unknown',
            toNetwork: chains[1]?.toLowerCase() || 'unknown'
        },
        nttGroups: {
            [nttGroupName]: {
                nttManagers: buildNttManagers(projectData.chains, tokenSymbol)
            }
        },
        tokensConfig
    };

    console.log('Generated Configuration:', JSON.stringify(config, null, 2));
    database.updateWormholeConnectConfig(network, tokenAddress, config)

    return config;
}

// Helper function to build tokensConfig
function buildTokensConfig(
    chainsData: Record<string, any>,
    tokenSymbol: string,
    tokenName: string,
    tokenLogo?: string
): Record<string, unknown> {
    const tokensConfig: Record<string, unknown> = {};

    for (const chainName of Object.keys(chainsData)) {
        const chain = chainsData[chainName];

        // Generate unique key for tokensConfig, e.g., 'FTTsep' for 'Sepolia'
        const tokenKey = `${tokenSymbol}${chainName.slice(0, 3).toLowerCase()}`;

        tokensConfig[tokenKey] = {
            key: tokenKey,
            symbol: tokenSymbol,
            nativeChain: chainName.toLowerCase(),
            displayName: `${tokenSymbol} (${chainName})`,
            tokenId: {
                chain: chainName.toLowerCase(),
                address: chain.token
            },
            coinGeckoId: 'test', // Placeholder, replace as necessary
            icon: tokenLogo || 'https://wormhole.com/token.png',
            color: '#00C3D9', // Set a default color
            decimals: {
                [chainName === 'Solana' ? 'Solana' : 'Ethereum']: chainName === 'Solana' ? 9 : 18,
                default: 8
            }
        };
    }

    return tokensConfig;
}

// Helper function to build nttManagers under the nttGroups section
function buildNttManagers(chainsData: Record<string, any>, tokenSymbol: string): Array<Record<string, unknown>> {
    const nttManagers = [];

    for (const chainName of Object.keys(chainsData)) {
        const chain = chainsData[chainName];

        // Generate tokenKey for this chain, e.g., 'FTTsep' for 'Sepolia'
        const tokenKey = `${tokenSymbol}${chainName.slice(0, 3).toLowerCase()}`;

        const managerConfig = {
            chainName: chainName.toLowerCase(),
            address: chain.manager,
            tokenKey,
            transceivers: [
                {
                    address: chain.transceivers.wormhole.address,
                    type: 'wormhole'
                }
            ]
        };

        nttManagers.push(managerConfig);
    }

    return nttManagers;
}
