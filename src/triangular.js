"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriangularArbitrage = void 0;
const rateLimiter_1 = require("./utils/rateLimiter");
const config_1 = require("./config");
class TriangularArbitrage {
    constructor(exchangeManager) {
        this.minProfitPercent = 0.5;
        // Define valid pairs for each exchange
        this.validPairs = {
            'binance': {
                'USDT': [
                    'BTC/USDT', 'ETH/USDT', 'BNB/USDT',
                    'SOL/USDT', 'XRP/USDT', 'ADA/USDT'
                ],
                'BTC': [
                    'ETH/BTC', 'BNB/BTC', 'SOL/BTC',
                    'XRP/BTC', 'ADA/BTC'
                ],
                'ETH': [
                    'BNB/ETH', 'LINK/ETH', 'MATIC/ETH'
                ]
            },
            'bybit': {
                'USDT': [
                    'BTC/USDT', 'ETH/USDT', 'SOL/USDT',
                    'XRP/USDT'
                ],
                'BTC': [
                    'ETH/BTC', 'SOL/BTC', 'XRP/BTC'
                ],
                'ETH': [
                    'LINK/ETH'
                ]
            },
            'kraken': {
                'USDT': [
                    'BTC/USDT', 'ETH/USDT', 'SOL/USDT',
                    'XRP/USDT'
                ],
                'BTC': [
                    'ETH/BTC', 'XRP/BTC'
                ],
                'ETH': [
                    'LINK/ETH'
                ]
            },
            'poloniex': {
                'USDT': [
                    'BTC/USDT', 'ETH/USDT', 'XRP/USDT'
                ],
                'BTC': [
                    'ETH/BTC', 'XRP/BTC'
                ],
                'ETH': [
                    'LINK/ETH'
                ]
            }
        };
        this.exchangeManager = exchangeManager;
        this.rateLimiter = new rateLimiter_1.RateLimiter();
        // Initialize valid pairs for Gate.io
        this.validPairs['gateio'] = {
            'USDT': config_1.config.exchangePairs.gateio.pairs.filter((p) => p.endsWith('/USDT')),
            'BTC': config_1.config.exchangePairs.gateio.pairs.filter((p) => p.endsWith('/BTC')),
            'ETH': config_1.config.exchangePairs.gateio.pairs.filter((p) => p.endsWith('/ETH'))
        };
    }
    async findTriangularOpportunities(exchange, baseAsset = 'USDT') {
        var _a;
        console.log(`\n📊 Scanning ${exchange.toUpperCase()} for triangular opportunities...`);
        console.log(`   Scanning ${baseAsset}...`);
        const exchangePairs = ((_a = this.validPairs[exchange]) === null || _a === void 0 ? void 0 : _a[baseAsset]) || [];
        if (!exchangePairs.length) {
            console.log(`   No valid pairs found for ${exchange} with ${baseAsset}`);
            return;
        }
        const triangles = this.getValidTriangles(exchange, baseAsset);
        for (const triangle of triangles) {
            try {
                await this.rateLimiter.throttle(exchange);
                const rates = await this.fetchTriangleRates(exchange, triangle);
                const profit = this.calculateTriangularProfit(rates);
                if (profit > this.minProfitPercent) {
                    console.log('\n💰 Triangular Opportunity Found:');
                    console.log(`🔄 Path: ${triangle.join(' -> ')}`);
                    console.log(`📈 Profit: ${profit.toFixed(2)}%`);
                    console.log(`⚡ Exchange: ${exchange}`);
                    console.log(`💱 Base Asset: ${baseAsset}\n`);
                }
            }
            catch (error) {
                // Silently skip invalid pairs
                continue;
            }
        }
        console.log('✓');
    }
    getValidTriangles(exchange, baseAsset) {
        var _a, _b;
        const triangles = [];
        const exchangePairs = ((_a = this.validPairs[exchange]) === null || _a === void 0 ? void 0 : _a[baseAsset]) || [];
        for (const firstPair of exchangePairs) {
            const [token1] = firstPair.split('/');
            if (token1 && ((_b = this.validPairs[exchange]) === null || _b === void 0 ? void 0 : _b[token1])) {
                const secondPairs = this.validPairs[exchange][token1] || [];
                for (const secondPair of secondPairs) {
                    const [token2] = secondPair.split('/');
                    const completingPair = `${token2}/${baseAsset}`;
                    if (exchangePairs.includes(completingPair)) {
                        triangles.push([firstPair, secondPair, completingPair]);
                    }
                }
            }
        }
        return triangles;
    }
    async fetchTriangleRates(exchange, triangle) {
        const rates = [];
        for (const pair of triangle) {
            const rate = await this.exchangeManager.fetchPrice(exchange, pair);
            if (rate <= 0) {
                throw new Error(`Invalid rate for ${pair}`);
            }
            rates.push(rate);
        }
        return rates;
    }
    calculateTriangularProfit(rates) {
        if (rates.length !== 3)
            return 0;
        const initialAmount = 1000; // Example starting amount
        const firstTrade = initialAmount / rates[0];
        const secondTrade = firstTrade * rates[1];
        const finalAmount = secondTrade * rates[2];
        return ((finalAmount - initialAmount) / initialAmount) * 100;
    }
}
exports.TriangularArbitrage = TriangularArbitrage;
