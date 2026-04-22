import { ExchangeManager } from './exchanges';
import { config } from './config';
import { ArbitrageOpportunity } from './types';
import { TriangularArbitrage } from './triangular';
import { PairValidator } from './utils/pairValidator';
import { RateLimiter } from './utils/rateLimiter';

export class ArbitrageBot {
    private exchangeManager: ExchangeManager;
    private triangularArbitrage: TriangularArbitrage;
    private pairValidator: PairValidator;
    private rateLimiter: RateLimiter;

    constructor() {
        this.exchangeManager = new ExchangeManager(config.exchanges);
        this.triangularArbitrage = new TriangularArbitrage(this.exchangeManager);
        this.pairValidator = new PairValidator(this.exchangeManager);
        this.rateLimiter = new RateLimiter();
    }

    async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
        const opportunities: ArbitrageOpportunity[] = [];

        const allPairs = new Set([
            ...config.tradingPairs,
            ...Object.values(config.exchangePairs)
                .flatMap(pairs => Array.isArray(pairs) ? pairs : pairs.pairs || [])
        ]);

        for (const symbol of allPairs) {
            const prices = new Map<string, number>();

            for (const exchange of config.exchanges) {
                try {
                    await this.rateLimiter.throttle(exchange.name);
                    const price = await this.exchangeManager.fetchPrice(exchange.name, symbol);
                    if (price > 0) {
                        prices.set(exchange.name, price);
                    }
                } catch (error) {
                    continue;
                }
            }

            if (prices.size >= 2) {
                for (const [buyExchange, buyPrice] of prices) {
                    for (const [sellExchange, sellPrice] of prices) {
                        if (buyExchange === sellExchange) continue;

                        const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;

                        if (profitPercent > config.minProfitPercent && profitPercent < 100) {
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

    public async start(): Promise<void> {
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

                for (const exchange of config.exchanges) {
                    await this.triangularArbitrage.findTriangularOpportunities(exchange.name);
                }

                await new Promise(resolve => setTimeout(resolve, 10000));
            } catch (error: any) {
                console.error('Error in arbitrage loop:', error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}