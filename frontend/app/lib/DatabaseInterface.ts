/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TokenData {
    network: string;
    tokenAddress: string;
    name: string;
    symbol: string;
    nttDeployment?: Record<string, any>; // JSON data
    lpData?: Record<string, any>; // JSON data
    logo?: string; // URL link
}

export interface DatabaseInterface {
    addToken(data: TokenData): Promise<void>;
    getTokenByAddress(tokenAddress: string): Promise<TokenData | null>;
    updateNttDeployment(network: string, tokenAddress: string, nttDeployment: Record<string, any>): Promise<void>;
    updateLpData(network: string, tokenAddress: string, lpData: Record<string, any>): Promise<void>;
    close(): Promise<void>;
}
