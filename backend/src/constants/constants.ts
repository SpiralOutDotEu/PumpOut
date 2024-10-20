// Used for `ntt add-chain ${chainString}`
export const ADD_CHAIN_ID_MAP: { [key: string]: string } = {
  '1': 'ethereum',
  '11155111': 'sepolia',
  '137': 'polygon',
  '42161': 'arbitrum',
  '421614': 'arbitrumSepolia',
  '8453': 'base',
  '84532': 'baseSepolia',
  '10': 'optimism',
  '11155420': 'optimismSepolia',
  '901': 'solana', // TODO: check chain ID solana devnet
  '101': 'sui',
  '102': 'sui', // TODO: check chain ID sui devnet
  '103': 'sui', // TODO: check chain ID sui testnet
  // Add other mappings as necessary
};
