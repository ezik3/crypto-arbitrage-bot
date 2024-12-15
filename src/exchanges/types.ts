import * as ccxt from 'ccxt';

export interface ExchangeManagerInterface {
    initialize(configs: ExchangeConfig[]): Promise<void>;
    fetchPrice(exchangeName: string, symbol: string): Promise<number>;
    getExchange(name: string): ccxt.Exchange | undefined;
}

export interface ExchangeConfig {
    name: string;
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
} 