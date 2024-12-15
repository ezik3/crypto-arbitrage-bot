import { ExchangeManager } from '../exchanges/exchangeManager';
import { config } from '../config';

interface PriceOpportunity {
    pair: string;
    profit: number;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
}

export class PriceScanner {
    constructor(private exchangeManager: ExchangeManager) {}

    public async initialize(): Promise<void> {
        console.log('Initializing price scanner...');
    }

    public async scanForArbitrageOpportunities(): Promise<PriceOpportunity[]> {
        const opportunities: PriceOpportunity[] = [];
        
        for (const exchange of config.exchanges) {
            const pairs = (config.exchangePairs as Record<string, string[]>)[exchange.name] || [];
            console.log(`Scanning ${exchange.name} for ${pairs.length} pairs...`);
            
            for (const pair of pairs) {
                try {
                    const price = await this.exchangeManager.fetchPrice(exchange.name, pair);
                    if (price > 0) {
                        // Check for arbitrage with other exchanges
                        for (const otherExchange of config.exchanges) {
                            if (otherExchange.name !== exchange.name && 
                                (config.exchangePairs as Record<string, string[]>)[otherExchange.name]?.includes(pair)) {
                                const otherPrice = await this.exchangeManager.fetchPrice(otherExchange.name, pair);
                                if (otherPrice > 0) {
                                    const profit = ((otherPrice - price) / price) * 100;
                                    if (profit > config.minProfitPercent) {
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
                } catch (error) {
                    console.debug(`Failed to fetch ${pair} price from ${exchange.name}`);
                    continue;
                }
            }
        }
        
        return opportunities;
    }
}
