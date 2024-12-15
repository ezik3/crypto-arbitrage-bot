import * as ccxt from 'ccxt';
import { ExchangeManagerInterface, ExchangeConfig } from './types';

export class ExchangeManager implements ExchangeManagerInterface {
    private exchanges: Map<string, ccxt.Exchange> = new Map();

    constructor(configs: ExchangeConfig[]) {
        // Empty constructor
    }

    public async initialize(configs: ExchangeConfig[]): Promise<void> {
        try {
            for (const config of configs) {
                const exchangeId = config.name.toLowerCase();
                const exchange = new (ccxt as any)[exchangeId]({
                    apiKey: config.apiKey,
                    secret: config.apiSecret,
                    password: config.passphrase,
                    enableRateLimit: true
                });
                
                await exchange.loadMarkets();
                console.log(`✅ ${config.name} connected`);
                this.exchanges.set(config.name, exchange);
            }
            console.log('✅ All exchanges initialized');
        } catch (error) {
            console.error('Error initializing exchanges:', error);
            throw error;
        }
    }

    public async fetchPrice(exchangeName: string, symbol: string): Promise<number> {
        const exchange = this.exchanges.get(exchangeName);
        if (!exchange) throw new Error(`Exchange ${exchangeName} not found`);
        
        try {
            const ticker = await exchange.fetchTicker(symbol);
            return ticker.last || 0;
        } catch (error) {
            console.error(`Error fetching price for ${symbol} on ${exchangeName}:`, error);
            return 0;
        }
    }

    public getExchange(name: string): ccxt.Exchange | undefined {
        return this.exchanges.get(name);
    }
}

export { ExchangeManager };
export type { ExchangeConfig, ExchangeManagerInterface }; 