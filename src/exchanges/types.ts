import * as ccxt from 'ccxt';

export interface ExchangeManagerInterface {
    exchanges: Map<string, any>;
    initialize(exchangeConfigs: ExchangeConfig[]): Promise<void>;
    initializeExchanges(exchangeConfigs: ExchangeConfig[]): Promise<void>;
    fetchPrice(exchangeName: string, symbol: string): Promise<number>;
    getExchange(name: string): any;
}

export interface ExchangeConfig {
    name: string;
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
}

export interface Exchange {
    fetchBalance(params?: any): Promise<any>;
    fetchTicker(symbol: string): Promise<any>;
    createOrder(symbol: string, type: string, side: string, amount: number, price?: number): Promise<any>;
    testConnection?(): Promise<boolean>;
} 