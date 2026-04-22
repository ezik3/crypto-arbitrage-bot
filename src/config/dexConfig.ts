import { DexConfig } from '../dex/interfaces/types';

export const DEX_CONFIGS: DexConfig[] = [
    {
        name: 'uniswap_v2',
        factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        chain: 'ethereum',
        rpcUrls: [process.env.ETH_RPC_URL || '']
    },
    {
        name: 'pancakeswap_v2',
        factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        chain: 'bsc',
        rpcUrls: [process.env.BSC_RPC_URL || '']
    }
    // Add more DEXes as needed
];

export const RPC_URLS: Record<string, string[]> = {
    ethereum: [
        process.env.ETH_RPC_URL || '',
        process.env.ETH_BACKUP_RPC_URL || ''
    ],
    bsc: [
        process.env.BSC_RPC_URL || '',
        process.env.BSC_BACKUP_RPC_URL || ''
    ]
};

// Validation thresholds
export const DEX_THRESHOLDS = {
    MINIMUM_LIQUIDITY_USD: 5000,
    MINIMUM_HOLDERS: 50,
    MAX_HOLDER_CONCENTRATION: 50,
    MIN_SECURITY_SCORE: 70,
    MAX_HONEYPOT_RISK: 0.3,
    MAX_BUY_TAX: 10,
    MAX_SELL_TAX: 10
};
