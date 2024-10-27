// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NttData, WormholeConnectConfig, ChainConfig, TokenConfig, ChainData, Route } from '../types/nttData';

export async function addNewNttFileService(data: NttData): Promise<WormholeConnectConfig> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectData, network } = data;
    const chains = Object.keys(projectData.chains);

    const config: WormholeConnectConfig = {
        network: projectData.network,
        chains,
        tokens: [],
        ui: {
            title: 'Wormhole NTT UI',
            defaultInputs: {
                fromChain: chains[0] || 'Unknown',
                toChain: chains[1] || 'Unknown',
            },
            showHamburgerMenu: false,
        },
        routes: [],
        tokensConfig: {}
    };

    // Step 3: Process chains and tokens to build routes and tokensConfig fields
    const routes = buildRoutes(projectData.chains);
    const tokensConfig = buildTokensConfig(projectData.chains);

    config.routes = routes;
    config.tokensConfig = tokensConfig;
    config.tokens = Object.keys(tokensConfig); // Extract tokens from tokensConfig

    console.log('Generated WormholeConnectConfig:', JSON.stringify(config, null, 2));
    return config;
}

// Helper function to build routes
function buildRoutes(chainsData: Record<string, ChainData>): Route[] {
    const routes: Route[] = [];
    console.log("chainsData: ", chainsData)

    Object.keys(chainsData).forEach((chainKey) => {
        const chain = chainsData[chainKey];
        const tokenKey = `WSV${chainKey.toLowerCase()}`;

        const route: Route = {
            tokens: {
                [tokenKey]: [{
                    chain: chainKey,
                    manager: chain.manager,
                    token: chain.token,
                    transceiver: [chain.transceivers.wormhole],
                }],
            },
        };

        routes.push(route);
    });

    return routes;
}

// Helper function to build tokensConfig
function buildTokensConfig(chainsData: Record<string, ChainData>): Record<string, TokenConfig> {
    const tokensConfig: Record<string, TokenConfig> = {};

    Object.keys(chainsData).forEach((chainKey) => {
        const chain = chainsData[chainKey];
        const tokenKey = `WSV${chainKey.toLowerCase()}`;

        tokensConfig[tokenKey] = {
            key: tokenKey,
            symbol: 'WSV',
            nativeChain: chainKey,
            displayName: 'WSV',
            tokenId: {
                chain: chainKey,
                address: chain.token,
            },
            coinGeckoId: 'wormhole',
            icon: 'https://wormhole.com/token.png',
            decimals: chainKey === 'Solana' ? 9 : 18,
        };
    });

    return tokensConfig;
}
