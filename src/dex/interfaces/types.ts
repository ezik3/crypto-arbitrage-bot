export interface TokenInfo {
    address: string;
    symbol?: string;
    name?: string;
    decimals?: number;
    totalSupply?: string;
    chain: string;
}

export interface PairInfo {
    address: string;
    token0: TokenInfo;
    token1: TokenInfo;
    reserve0: string;
    reserve1: string;
    timestamp: number;
}

export interface DexConfig {
    name: string;
    factoryAddress: string;
    routerAddress: string;
    chain: string;
    rpcUrls: string[];
}

export interface TokenAnalysis {
    liquidityUSD: number;
    securityScore: number;
    honeypotRisk: number;
    buyTax: number;
    sellTax: number;
    isContractVerified: boolean;
    holderAnalysis: {
        totalHolders: number;
        topHoldersConcentration: number;
    };
}

export interface PairAnalysisResult extends TokenAnalysis {
    pairInfo: PairInfo;
    isValid: boolean;
}
