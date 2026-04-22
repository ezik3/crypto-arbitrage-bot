export interface SnipingConfig {
    minLiquidity: number;
    maxBuyTax: number;
    maxSellTax: number;
    minHolders: number;
    minSecurityScore: number;
    retryAttempts: number;
    retryDelay: number;
}

export interface TokenInfo {
    address: string;
    liquidity: number;
    securityScore: number;
    buyTax?: number;
    sellTax?: number;
    holders?: number;
}
