export interface ExchangePairConfig {
    pairs: string[];
    options?: {
        enforceMarketValidation: boolean;
        retryOnEmpty: boolean;
        timeout: number;
        reconnectDelay: number;
    };
}

export interface ExchangePairs {
    [exchange: string]: string[] | ExchangePairConfig;
}
