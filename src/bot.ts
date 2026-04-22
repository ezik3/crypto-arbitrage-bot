import { ExchangeManager } from './exchanges/exchangeManager';
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

        // Get all pairs as array to avoid Set iteration issues
        const allPairsArray = [
            ...config.tradingPairs,
            ...Object.values(config.exchangePairs).flatMap(pairs => 
                Array.isArray(pairs) ? pairs : pairs.pairs || []
            )
        ];
        const allPairs = Array.from(new Set(allPairsArray));

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
                // Convert Map to arrays to avoid Map iteration issues
                const priceEntries = Array.from(prices.entries());
                
                for (let i = 0; i < priceEntries.length; i++) {
                    const [buyExchange, buyPrice] = priceEntries[i];
                    
                    for (let j = 0; j < priceEntries.length; j++) {
                        if (i === j) continue;
                        const [sellExchange, sellPrice] = priceEntries[j];

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