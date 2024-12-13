import * as ccxt from 'ccxt';
import { ExchangeConfig } from './types';

export class ExchangeManager {
    private exchanges: Map<string, ccxt.Exchange> = new Map();

    constructor(exchangeConfigs: ExchangeConfig[]) {
        this.initializeExchanges(exchangeConfigs);
    }

    private initializeExchanges(configs: ExchangeConfig[]) {
        configs.forEach(config => {
            const exchangeId = config.name.toLowerCase();
            // Create exchange instance using the dynamic constructor approach
            const exchange = new (ccxt as any)[exchangeId]({
                apiKey: config.apiKey,
                secret: config.apiSecret
            });
            this.exchanges.set(config.name, exchange);
        });
    }

    async fetchPrice(exchangeName: string, symbol: string): Promise<number> {
        const exchange = this.exchanges.get(exchangeName);
        if (!exchange) throw new Error(`Exchange ${exchangeName} not found`);
        
        const ticker = await exchange.fetchTicker(symbol);
        return ticker.last || 0; // Providing a fallback value of 0
    }
}