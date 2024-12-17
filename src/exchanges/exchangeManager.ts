import { Exchange } from './types';
import { GateIoExchange } from './gateio';
import * as ccxt from 'ccxt';

export class ExchangeManager {
    private exchanges: Map<string, Exchange>;

    constructor() {
        this.exchanges = new Map();

        // Initialize Gate.io
        if (process.env.GATEIO_API_KEY && process.env.GATEIO_API_SECRET) {
            this.exchanges.set(
                'gateio',
                new GateIoExchange(
                    process.env.GATEIO_API_KEY!,
                    process.env.GATEIO_API_SECRET!
                )
            );
        }

        // Initialize all CCXT exchanges
        const exchangeConfigs = [
            { name: 'binance', className: ccxt.binance },
            { name: 'bybit', className: ccxt.bybit },
            { name: 'kucoin', className: ccxt.kucoin },
            { name: 'kraken', className: ccxt.kraken },
            { name: 'poloniex', className: ccxt.poloniex }
        ];

        for (const config of exchangeConfigs) {
            if (process.env[`${config.name.toUpperCase()}_API_KEY`]) {
                const exchangeConfig: any = {
                    apiKey: process.env[`${config.name.toUpperCase()}_API_KEY`],
                    secret: process.env[`${config.name.toUpperCase()}_API_SECRET`]
                };

                // Add passphrase for KuCoin
                if (config.name === 'kucoin') {
                    exchangeConfig.password = process.env.KUCOIN_API_PASSPHRASE;
                }

                this.exchanges.set(config.name, new config.className(exchangeConfig));
            }
        }
    }

    async initializeExchanges(): Promise<void> {
        for (const [name, exchange] of this.exchanges) {
            try {
                if (exchange.testConnection) {
                    await exchange.testConnection();
                }
                console.log(`✅ ${name.toUpperCase()} exchange initialized successfully`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name.toUpperCase()} exchange:`, error);
            }
        }
    }

    getExchange(name: string): Exchange | undefined {
        return this.exchanges.get(name.toLowerCase());
    }

    getAllExchanges(): Map<string, Exchange> {
        return this.exchanges;
    }

    async testConnections(): Promise<void> {
        for (const [name, exchange] of this.exchanges) {
            console.log(`Testing ${name} connection...`);
            if (exchange.testConnection) {
                await exchange.testConnection();
            }
        }
    }

    async fetchPrice(exchangeName: string, symbol: string): Promise<number> {
        try {
            const exchange = this.exchanges.get(exchangeName.toLowerCase());
            if (!exchange) {
                throw new Error(`Exchange ${exchangeName} not found`);
            }

            const ticker = await exchange.fetchTicker(symbol);
            return ticker.last;
        } catch (error) {
            console.error(`Error fetching price from ${exchangeName} for ${symbol}:`, error);
            throw error;
        }
    }
}
