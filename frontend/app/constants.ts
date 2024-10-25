export const NETWORKS = [
  {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.basescan.org/',
    contractAddress: '0xYourContractAddress',
    supported: true,
  },
  {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://endpoints.omniatech.io/v1/arbitrum/sepolia/public',
    explorerUrl: 'https://sepolia.arbiscan.io/',
    contractAddress: '0xYourContractAddress',
    supported: true,
  },
  {
    chainId: 901,
    name: 'Solana',
    rpcUrl: '',
    explorerUrl: '',
    contractAddress: '',
    supported: false, // Coming soon
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-INFURA-PROJECT-ID',
    explorerUrl: 'https://etherscan.io',
    contractAddress: '0xYourContractAddress',
    supported: false,
  },

];

export const CHAIN_ID_OPTIONS = [
  
  { chainId: 84532, name: 'Base Sepolia', supported: true },
  { chainId: 421614, name: 'Arbitrum Sepolia', supported: true },
  { chainId: 901, name: 'Solana', supported: true }, 
  { chainId: 101, name: 'SUI', supported: false }, 
  { chainId: 1, name: 'Ethereum Mainnet', supported: false },
  // Add other chain IDs here
];