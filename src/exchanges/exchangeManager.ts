import Binance from 'binance-api-node';
const KucoinAPI = require('kucoin-node-api') as any;
import { LinearClient } from 'bybit-api';
import { ExchangeConfig } from '../types';
import { ExchangeManagerInterface } from './types';
import * as ccxt from 'ccxt';

export class ExchangeManager implements ExchangeManagerInterface {
    public exchanges: Map<string, ccxt.Exchange> = new Map();
    private binanceClient: ReturnType<typeof Binance> = Binance();
    private kucoinClient: any;
    private bybitClient: LinearClient = new LinearClient();
    
    constructor(exchangeConfigs: ExchangeConfig[]) {
        this.initializeClients();
        this.initialize(exchangeConfigs);
    }

    public async initialize(exchangeConfigs: ExchangeConfig[]): Promise<void> {
        await this.initializeExchanges(exchangeConfigs);
    }

    public async initializeExchanges(exchangeConfigs: ExchangeConfig[]): Promise<void> {
        try {
            this.initializeClients();

            for (const config of exchangeConfigs) {
                const exchange = await this.createExchange(config);
                this.exchanges.set(config.name.toLowerCase(), exchange);
                console.log(`✅ ${config.name} connected`);
            }

            await this.binanceClient.ping();
            console.log('✅ Binance connected');
            console.log('✅ All exchanges initialized');
        } catch (error) {
            console.error('Error initializing exchanges:', error);
            throw error;
        }
    }

    public async fetchPrice(exchangeName: string, symbol: string): Promise<number> {
        try {
            const exchange = this.exchanges.get(exchangeName);
            if (!exchange) {
                return 0;
            }

            const ticker = await exchange.fetchTicker(symbol);
            return ticker.last || 0;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes('BadSymbol'))) {
                console.error(`Error fetching ${symbol} on ${exchangeName}:`, error);
            }
            return 0;
        }
    }

    public getExchange(name: string): ccxt.Exchange | undefined {
        return this.exchanges.get(name.toLowerCase());
    }

    private async createExchange(config: ExchangeConfig): Promise<ccxt.Exchange> {
        const exchangeId = config.name.toLowerCase();
        const exchange = new (ccxt as any)[exchangeId]({
            apiKey: config.apiKey,
            secret: config.apiSecret,
            password: config.passphrase,
            enableRateLimit: true
        });
        
        await exchange.loadMarkets();
        return exchange;
    }

    private initializeClients(): void {
        this.binanceClient = Binance({
            apiKey: process.env.BINANCE_API_KEY,
            apiSecret: process.env.BINANCE_API_SECRET
        });

        KucoinAPI.init({
            apiKey: process.env.KUCOIN_API_KEY,
            secretKey: process.env.KUCOIN_API_SECRET,
            passphrase: process.env.KUCOIN_API_PASSPHRASE
        });
        this.kucoinClient = KucoinAPI;

        this.bybitClient = new LinearClient({
            key: process.env.BYBIT_API_KEY,
            secret: process.env.BYBIT_API_SECRET
        });
    }
}