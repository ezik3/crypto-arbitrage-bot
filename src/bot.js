"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbitrageBot = void 0;
const exchanges_1 = require("./exchanges");
const config_1 = require("./config");
const triangular_1 = require("./triangular");
const pairValidator_1 = require("./utils/pairValidator");
const rateLimiter_1 = require("./utils/rateLimiter");
class ArbitrageBot {
    constructor() {
        this.exchangeManager = new exchanges_1.ExchangeManager(config_1.config.exchanges);
        this.triangularArbitrage = new triangular_1.TriangularArbitrage(this.exchangeManager);
        this.pairValidator = new pairValidator_1.PairValidator(this.exchangeManager);
        this.rateLimiter = new rateLimiter_1.RateLimiter();
    }
    async findArbitrageOpportunities() {
        const opportunities = [];
        const allPairs = new Set([
            ...config_1.config.tradingPairs,
            ...Object.values(config_1.config.exchangePairs)
                .flatMap(pairs => Array.isArray(pairs) ? pairs : pairs.pairs || [])
        ]);
        for (const symbol of allPairs) {
            const prices = new Map();
            for (const exchange of config_1.config.exchanges) {
                try {
                    await this.rateLimiter.throttle(exchange.name);
                    const price = await this.exchangeManager.fetchPrice(exchange.name, symbol);
                    if (price > 0) {
                        prices.set(exchange.name, price);
                    }
                }
                catch (error) {
                    continue;
                }
            }
            if (prices.size >= 2) {
                for (const [buyExchange, buyPrice] of prices) {
                    for (const [sellExchange, sellPrice] of prices) {
                        if (buyExchange === sellExchange)
                            continue;
                        const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
                        if (profitPercent > config_1.config.minProfitPercent && profitPercent < 100) {
                            opportunities.push({
                                buyExchange,
                                sellExchange,
                                symbol,
                                profitPercent,
                                timestamp: Date.now()
                            });
                        }
                    }
                }
            }
        }
        return opportunities;
    }
    async start() {
        console.log('Starting arbitrage bot...');
        while (true) {
            try {
                const opportunities = await this.findArbitrageOpportunities();
                if (opportunities.length > 0) {
                    console.log('Found cross-exchange arbitrage opportunities:');
                    opportunities.forEach(opp => {
                        console.log(`${opp.symbol}: Buy on ${opp.buyExchange}, Sell on ${opp.sellExchange}, Profit: ${opp.profitPercent.toFixed(2)}%`);
                    });
                }
                for (const exchange of config_1.config.exchanges) {
                    await this.triangularArbitrage.findTriangularOpportunities(exchange.name);
                }
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
            catch (error) {
                console.error('Error in arbitrage loop:', error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}
exports.ArbitrageBot = ArbitrageBot;
