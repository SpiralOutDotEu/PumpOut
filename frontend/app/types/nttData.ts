export interface Transceiver {
    address: string;
    type: string;
}

export interface ChainData {
    version: string;
    mode: string;
    paused: boolean;
    owner: string;
    manager: string;
    token: string;
    transceivers: {
        threshold: number;
        wormhole: Transceiver;
    };
    limits: {
        outbound: string;
        inbound: Record<string, string>;
    };
    pauser: string;
}

export interface NttData {
    projectData: {
        network: string;
        chains: Record<string, ChainData>;
    };
    network: string;
    tokenAddress: string;
}

// WormholeConnectConfig types
export interface WormholeConnectConfig {
    network: string;
    chains: string[];
    tokens: string[];
    ui: {
        title: string;
        defaultInputs: {
            fromChain: string;
            toChain: string;
        };
        showHamburgerMenu: boolean;
    };
    routes: Route[];
    tokensConfig: Record<string, TokenConfig>;
}

export interface Route {
    tokens: {
        [key: string]: Array<ChainConfig>;
    };
}

export interface ChainConfig {
    chain: string;
    manager: string;
    token: string;
    transceiver: Transceiver[];
}

export interface TokenConfig {
    key: string;
    symbol: string;
    nativeChain: string;
    displayName: string;
    tokenId: {
        chain: string;
        address: string;
    };
    coinGeckoId: string;
    icon: string;
    decimals: number;
}
