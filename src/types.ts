export interface ExchangeConfig {
    name: string;
    apiKey: string;
    apiSecret: string;
}

export interface ArbitrageOpportunity {
    buyExchange: string;
    sellExchange: string;
    symbol: string;
    profitPercent: number;
    timestamp: number;
}
