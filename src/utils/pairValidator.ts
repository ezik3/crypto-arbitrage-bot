import { ExchangeManager } from '../exchanges/exchangeManager';

export class PairValidator {
    private exchangeManager: ExchangeManager;

    constructor(exchangeManager: ExchangeManager) {
        this.exchangeManager = exchangeManager;
    }

    async validatePair(exchangeName: string, symbol: string): Promise<boolean> {
        try {
            // Try to fetch the price to see if pair exists
            const price = await this.exchangeManager.fetchPrice(exchangeName, symbol);
            return price > 0;
        } catch (error) {
            return false;
        }
    }

    async validateMultiplePairs(exchangeName: string, symbols: string[]): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>();
        
        for (const symbol of symbols) {
            try {
                const isValid = await this.validatePair(exchangeName, symbol);
                results.set(symbol, isValid);
            } catch (error) {
                results.set(symbol, false);
            }
        }
        
        return results;
    }

    filterValidPairs(exchangeName: string, symbols: string[]): Promise<string[]> {
        return new Promise(async (resolve) => {
            const validPairs: string[] = [];
            
            for (const symbol of symbols) {
                if (await this.validatePair(exchangeName, symbol)) {
                    validPairs.push(symbol);
                }
            }
            
            resolve(validPairs);
        });
    }

    getTradingParameters(symbol: string): {
        minOrderSize: number;
        maxOrderSize: number;
        pricePrecision: number;
        amountPrecision: number;
    } {
        // Default parameters - in real implementation, fetch from exchange
        const defaults: Record<string, any> = {
            'BTC/USDT': { minOrderSize: 0.0001, maxOrderSize: 100, pricePrecision: 2, amountPrecision: 6 },
            'ETH/USDT': { minOrderSize: 0.001, maxOrderSize: 1000, pricePrecision: 2, amountPrecision: 5 },
            'SOL/USDT': { minOrderSize: 0.01, maxOrderSize: 10000, pricePrecision: 3, amountPrecision: 3 },
            'XRP/USDT': { minOrderSize: 1, maxOrderSize: 100000, pricePrecision: 4, amountPrecision: 0 },
            'ADA/USDT': { minOrderSize: 1, maxOrderSize: 100000, pricePrecision: 4, amountPrecision: 0 },
        };

        return defaults[symbol] || { 
            minOrderSize: 0.01, 
            maxOrderSize: 1000, 
            pricePrecision: 4, 
            amountPrecision: 2 
        };
    }

    isMarketActive(symbol: string): Promise<boolean> {
        // Simplified - always return true for now
        // In real implementation, check exchange for market status
        return Promise.resolve(true);
    }

    hasSufficientLiquidity(symbol: string, amount: number): Promise<boolean> {
        // Simplified - always return true for now
        // In real implementation, check order book depth
        return Promise.resolve(true);
    }
}