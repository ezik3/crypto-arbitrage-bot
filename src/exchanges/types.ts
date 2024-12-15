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