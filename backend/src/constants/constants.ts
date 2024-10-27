// Used for `ntt add-chain ${chainString}`
export const ADD_CHAIN_ID_MAP: { [key: string]: string } = {
  '1': 'Ethereum',
  '11155111': 'Sepolia',
  '137': 'Polygon',
  '42161': 'Arbitrum',
  '421614': 'ArbitrumSepolia',
  '8453': 'Base',
  '84532': 'BaseSepolia',
  '10': 'Optimism',
  '11155420': 'OptimismSepolia',
  '901': 'Solana', // TODO: check chain ID solana devnet
  '101': 'Sui',
  '102': 'Sui', // TODO: check chain ID sui devnet
  '103': 'Sui', // TODO: check chain ID sui testnet
  // Add other mappings as necessary
};
