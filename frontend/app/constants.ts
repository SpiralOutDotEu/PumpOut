export const NETWORKS = [
  {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.basescan.org/',
    factoryContractAddress: '0xd06D79a3AC08835c2bBAc26e5D88C664f3570d96',
    supported: true,
  },
  {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io/',
    factoryContractAddress: '0xf8245DaCE78EA5534EFD5b4070bb47a065a09497',
    supported: true,
  },
  {
    chainId: 901,
    name: 'Solana',
    rpcUrl: '',
    explorerUrl: '',
    factoryContractAddress: '',
    supported: false, // Coming soon
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-INFURA-PROJECT-ID',
    explorerUrl: 'https://etherscan.io',
    factoryContractAddress: '0xYourContractAddress',
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

export const NTT_CONNECT_NETWORK_NAME_MAP: Record<string, string> = {
  BaseSepolia: 'base_sepolia',
  Base: 'base',
  ArbitrumSepolia: 'arbitrum_sepolia',
  Sepolia: 'sepolia',
  Ethereum: 'ethereum',
  Solana: 'solana',
  // Add more mappings as needed
};