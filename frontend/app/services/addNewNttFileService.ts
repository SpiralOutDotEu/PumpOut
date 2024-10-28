/* eslint-disable @typescript-eslint/no-explicit-any */
import { NttData } from '../types/nttData';
import { database } from '../lib/db'; // Assuming you have a database service
import { NTT_CONNECT_NETWORK_NAME_MAP } from '../constants';

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
    const tokenLogo = token.logo;

    // Map network names based on constants
    const mappedChains = chains.map(chain => NTT_CONNECT_NETWORK_NAME_MAP[chain] || chain.toLowerCase());

    // Build tokensConfig with unique keys for each network
    const tokensConfig = buildTokensConfig(projectData.chains, tokenSymbol, tokenName, tokenLogo);

    // Construct the main configuration JSON structure
    const config = {
        env: projectData.network.toLowerCase(), // Assuming network is uppercase in the projectData
        networks: mappedChains,
        bridgeDefaults: {
            fromNetwork: mappedChains[0] || 'unknown',
            toNetwork: mappedChains[1] || 'unknown'
        },
        nttGroups: {
            NTT_GROUP: { // Use generic name for the NTT group
                nttManagers: buildNttManagers(projectData.chains, tokenSymbol)
            }
        },
        tokensConfig
    };

    console.log('Generated Configuration:', JSON.stringify(config, null, 2));
    database.updateWormholeConnectConfig(network, tokenAddress, config);

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
        const mappedChainName = NTT_CONNECT_NETWORK_NAME_MAP[chainName] || chainName.toLowerCase();

        // Generate unique token key
        const tokenKey = `${tokenSymbol}${mappedChainName.slice(0, 3)}${mappedChainName.slice(-3)}`;

        tokensConfig[tokenKey] = {
            key: tokenKey,
            symbol: tokenSymbol,
            nativeChain: mappedChainName,
            displayName: `${tokenName} (${mappedChainName.charAt(0).toUpperCase() + mappedChainName.slice(1)})`,
            tokenId: {
                chain: mappedChainName,
                address: chain.token
            },
            coinGeckoId: 'test', // Placeholder, replace as necessary
            icon: tokenLogo || 'https://wormhole.com/token.png',
            color: '#00C3D9', // Default color
            decimals: {
                [mappedChainName === 'solana' ? 'Solana' : 'Ethereum']: mappedChainName === 'solana' ? 9 : 18,
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
        const mappedChainName = NTT_CONNECT_NETWORK_NAME_MAP[chainName] || chainName.toLowerCase();

        // Generate tokenKey for this chain
        const tokenKey = `${tokenSymbol}${mappedChainName.slice(0, 3)}${mappedChainName.slice(-3)}`;

        const managerConfig = {
            chainName: mappedChainName,
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
