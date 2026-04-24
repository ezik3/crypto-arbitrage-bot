"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairValidator = void 0;
class PairValidator {
    constructor(exchangeManager) {
        this.validPairsCache = new Map();
        this.exchangeManager = exchangeManager;
    }
    async validatePairsForExchange(exchange, pairs) {
        if (this.validPairsCache.has(exchange)) {
            const cachedPairs = this.validPairsCache.get(exchange);
            return pairs.filter(pair => cachedPairs.has(pair));
        }
        const validPairs = new Set();
        console.log(`Validating ${pairs.length} pairs for ${exchange}...`);
        for (const pair of pairs) {
            try {
                const price = await this.exchangeManager.fetchPrice(exchange, pair);
                if (price > 0) {
                    validPairs.add(pair);
                }
            }
            catch (error) {
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
exports.PairValidator = PairValidator;
