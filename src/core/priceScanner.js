"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceScanner = void 0;
const config_1 = require("../config");
const rateLimiter_1 = require("../utils/rateLimiter");
const pairValidator_1 = require("../utils/pairValidator");
class PriceScanner {
    constructor(exchangeManager) {
        this.exchangeManager = exchangeManager;
        this.rateLimiter = new rateLimiter_1.RateLimiter();
        this.pairValidator = new pairValidator_1.PairValidator(exchangeManager);
    }
    async initialize() {
        console.log('Initializing price scanner...');
    }
    async scanForArbitrageOpportunities() {
        const opportunities = [];
        for (const exchange of config_1.config.exchanges) {
            let pairs = [];
            if (exchange.name === 'gateio') {
                pairs = config_1.config.exchangePairs.gateio.pairs;
            }
            else {
                pairs = config_1.config.exchangePairs[exchange.name] || [];
            }
            // Validate pairs first
            const validPairs = await this.pairValidator.validatePairsForExchange(exchange.name, pairs);
            console.log(`Scanning ${exchange.name} for ${validPairs.length} validated pairs...`);
            for (const pair of validPairs) {
                try {
                    await this.rateLimiter.throttle(exchange.name);
                    const price = await this.exchangeManager.fetchPrice(exchange.name, pair);
                    if (price > 0) {
                        // Check for arbitrage with other exchanges
                        for (const otherExchange of config_1.config.exchanges) {
                            if (otherExchange.name === exchange.name)
                                continue;
                            let otherPairs = [];
                            if (otherExchange.name === 'gateio') {
                                otherPairs = config_1.config.exchangePairs.gateio.pairs;
                            }
                            else {
                                otherPairs = config_1.config.exchangePairs[otherExchange.name] || [];
                            }
                            if (otherPairs.includes(pair)) {
                                const otherPrice = await this.exchangeManager.fetchPrice(otherExchange.name, pair);
                                if (otherPrice > 0) {
                                    const profit = ((otherPrice - price) / price) * 100;
                                    if (profit > config_1.config.minProfitPercent) {
                                        opportunities.push({
                                            pair,
                                            profit,
                                            buyExchange: exchange.name,
                                            sellExchange: otherExchange.name,
                                            buyPrice: price,
                                            sellPrice: otherPrice
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                catch (error) {
                    console.debug(`Failed to fetch ${pair} price from ${exchange.name}`);
                    continue;
                }
            }
        }
        return opportunities;
    }
}
exports.PriceScanner = PriceScanner;
