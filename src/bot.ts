import { ExchangeManager } from './exchanges';
import { config } from './config';
import { ArbitrageOpportunity } from './types';
import { TriangularArbitrage } from './triangular';

export class ArbitrageBot {
    private exchangeManager: ExchangeManager;
    private triangularArbitrage: TriangularArbitrage;

    constructor() {
        this.exchangeManager = new ExchangeManager(config.exchanges);
        this.triangularArbitrage = new TriangularArbitrage(this.exchangeManager);
    }

    async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
        const opportunities: ArbitrageOpportunity[] = [];

        for (const symbol of config.tradingPairs) {
            const prices = new Map<string, number>();

            // Fetch prices from all exchanges
            for (const exchange of config.exchanges) {
                try {
                    const price = await this.exchangeManager.fetchPrice(exchange.name, symbol);
                    if (price > 0) {  // Only store valid prices
                        prices.set(exchange.name, price);
                    }
                } catch (error: any) {
                    // Silently skip unavailable pairs
                    continue;
                }
            }

            // Check for arbitrage if we have prices from at least 2 exchanges
            if (prices.size >= 2) {
                for (const [buyExchange, buyPrice] of prices) {
                    for (const [sellExchange, sellPrice] of prices) {
                        if (buyExchange === sellExchange) continue;

                        const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;

                        if (profitPercent > config.minProfitPercent && profitPercent < 100) { // Add reasonable upper limit
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
                // Regular arbitrage opportunities
                const opportunities = await this.findArbitrageOpportunities();
                
                if (opportunities.length > 0) {
                    console.log('Found cross-exchange arbitrage opportunities:');
                    opportunities.forEach(opp => {
                        console.log(`${opp.symbol}: Buy on ${opp.buyExchange}, Sell on ${opp.sellExchange}, Profit: ${opp.profitPercent.toFixed(2)}%`);
                    });
                }

                // Triangular arbitrage opportunities
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