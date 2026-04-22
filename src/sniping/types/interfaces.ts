export interface TokenMetadata {
    address: string;
    chain: string;
    pair?: string;
    creationTime: number;
    liquidityAmount?: number;
    source: string;
    securityScore?: number;
    buyTax?: number;
    sellTax?: number;
    liquidity?: number;
    symbol?: string;
    marketCap?: number;
    volume24h?: number;
    holders?: number;
    name?: string;    // Added this field
    rate?: number;
}

export interface SecurityReport {
    isHoneypot: boolean;
    rugPullRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    liquidityLocked: boolean;
    contractVerified: boolean;
    ownershipRenounced: boolean;
    score: number;
}

export interface SnipingConfig {
    minLiquidity: number;
    maxBuyTax: number;
    maxSellTax: number;
    minHolders: number;
    minSecurityScore: number;
}
