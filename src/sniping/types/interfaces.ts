export interface TokenMetadata {
    address: string;
    name: string;
    symbol: string;
    creationTime: number;
    liquidityAmount: number;
    marketCap?: number;
    volume24h?: number;
    holders?: number;
    securityScore?: number;
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
