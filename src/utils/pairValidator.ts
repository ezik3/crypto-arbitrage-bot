import { ExchangeManager } from '../exchanges/exchangeManager';
import { config } from '../config';

export class PairValidator {
    private exchangeManager: ExchangeManager;
    private validPairsCache: Map<string, Set<string>> = new Map();
    
    constructor(exchangeManager: ExchangeManager) {
        this.exchangeManager = exchangeManager;
    }

    async validatePairsForExchange(exchange: string, pairs: string[]): Promise<string[]> {
        if (this.validPairsCache.has(exchange)) {
            const cachedPairs = this.validPairsCache.get(exchange)!;
            return pairs.filter(pair => cachedPairs.has(pair));
        }

        const validPairs = new Set<string>();
        console.log(`Validating ${pairs.length} pairs for ${exchange}...`);

        for (const pair of pairs) {
            try {
                const price = await this.exchangeManager.fetchPrice(exchange, pair);
                if (price > 0) {
                    validPairs.add(pair);
                }
            } catch (error) {
                continue; // Skip invalid pairs
            }
        }

        this.validPairsCache.set(exchange, validPairs);
        return Array.from(validPairs);
    }

    clearCache() {
        this.validPairsCache.clear();
    }
}
