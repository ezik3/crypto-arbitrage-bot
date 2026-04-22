import { ApiClient, SpotApi } from 'gate-api';
import { Exchange } from './types';
import { config } from '../config';

export class GateIoExchange implements Exchange {
    private client: SpotApi;
    private pairs: string[];

    constructor(apiKey: string, apiSecret: string) {
        const client = new ApiClient();
        client.setApiKeySecret(apiKey, apiSecret);
        this.client = new SpotApi(client);
        this.pairs = config.exchangePairs.gateio.pairs;
    }

    async fetchTradingPairs(): Promise<string[]> {
        try {
            const response = await this.client.listCurrencyPairs();
            let availablePairs = response.body;
            
            if (!availablePairs || availablePairs.length === 0) {
                console.log('⚠️ No pairs returned from Gate.io API, using configured pairs');
                return this.pairs;
            }
            
            const validPairs = this.pairs.filter(pair => 
                availablePairs.some((ap: any) => ap.id === pair.replace('/', '_'))
            );

            if (validPairs.length === 0) {
                console.log('⚠️ No valid pairs found, using configured pairs');
                return this.pairs;
            }

            return validPairs;
        } catch (error) {
            console.error('Error fetching Gate.io pairs:', error);
            return this.pairs;
        }
    }

    async fetchTicker(symbol: string): Promise<any> {
        try {
            const formattedSymbol = symbol.replace('/', '_');
            const response = await (this.client.listTickers as any)({
                currencyPair: formattedSymbol,
                __stringValue__: ''
            });
            
            if (!response.body?.[0]) {
                throw new Error('No ticker data received');
            }

            return {
                symbol,
                last: parseFloat(response.body[0].last)
            };
        } catch (error) {
            console.error(`Error fetching price from Gate.io for ${symbol}:`, error);
            throw error;
        }
    }

    async fetchBalance(params?: any): Promise<any> {
        try {
            const currency = params?.currency ? params.currency.toUpperCase() : 'USDT';
            const response = await (this.client.listSpotAccounts as any)({
                currency,
                __stringValue__: ''
            });
            
            if (!response.body?.[0]) {
                return { free: 0, used: 0, total: 0 };
            }
            
            const balance = response.body[0];
            return {
                free: parseFloat(balance.available),
                used: parseFloat(balance.locked),
                total: parseFloat(balance.available) + parseFloat(balance.locked)
            };
        } catch (error) {
            console.error('Error fetching balance from Gate.io:', error);
            throw error;
        }
    }

    async createOrder(symbol: string, type: string, side: string, amount: number, price?: number): Promise<any> {
        try {
            const formattedSymbol = symbol.replace('/', '_');
            const response = await (this.client.createOrder as any)({
                currencyPair: formattedSymbol,
                side: side.toLowerCase(),
                amount: amount.toString(),
                price: price?.toString() ?? '0',
                type: type.toLowerCase(),
                __stringValue__: ''
            });
            
            return response.body;
        } catch (error) {
            console.error('Error creating order on Gate.io:', error);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.client.listCurrencies();
            console.log('Gate.io API connection successful!');
            return true;
        } catch (error) {
            console.error('Gate.io API connection failed:', error);
            return false;
        }
    }
}

// Update pair format for Gate.io
const formatGateIoPair = (pair: string) => {
    return pair.replace('/', '_').toUpperCase();
};

// Update the currency pair format
const formatPair = (pair: string) => pair.replace('/', '_');

