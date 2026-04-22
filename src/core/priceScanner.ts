import { ExchangeManager } from '../exchanges/exchangeManager';
import { config } from '../config';
import { RateLimiter } from '../utils/rateLimiter';
import { PairValidator } from '../utils/pairValidator';

interface PriceOpportunity {
    pair: string;
    profit: number;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
}

export class PriceScanner {
    private rateLimiter: RateLimiter;
    private pairValidator: PairValidator;

    constructor(private exchangeManager: ExchangeManager) {
        this.rateLimiter = new RateLimiter();
        this.pairValidator = new PairValidator(exchangeManager);
    }

    public async initialize(): Promise<void> {
        console.log('Initializing price scanner...');
    }

    public async scanForArbitrageOpportunities(): Promise<PriceOpportunity[]> {
        const opportunities: PriceOpportunity[] = [];
        
        for (const exchange of config.exchanges) {
            let pairs: string[] = [];
            if (exchange.name === 'gateio') {
                pairs = (config.exchangePairs.gateio as { pairs: string[] }).pairs;
            } else {
                pairs = (config.exchangePairs as Record<string, string[]>)[exchange.name] || [];
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
                        for (const otherExchange of config.exchanges) {
                            if (otherExchange.name === exchange.name) continue;

                            let otherPairs: string[] = [];
                            if (otherExchange.name === 'gateio') {
                                otherPairs = (config.exchangePairs.gateio as { pairs: string[] }).pairs;
                            } else {
                                otherPairs = (config.exchangePairs as Record<string, string[]>)[otherExchange.name] || [];
                            }

                            if (otherPairs.includes(pair)) {
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
