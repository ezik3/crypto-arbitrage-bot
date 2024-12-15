import { ExchangeManager } from '../exchanges/exchangeManager';
import { config } from '../config';

export class PriceScanner {
    constructor(private exchangeManager: ExchangeManager) {}

    async scanForArbitrageOpportunities() {
        const { tradingPairs } = config;
        
        setInterval(async () => {
            for (const pair of tradingPairs) {
                const prices = await this.getPricesAcrossExchanges(pair);
                const opportunities = this.findArbitrageOpportunities(prices);
                
                if (opportunities.length > 0) {
                    console.log(`💰 Found ${opportunities.length} opportunities for ${pair}`);
                    opportunities.forEach(opp => {
                        console.log(`Buy on ${opp.buyExchange} at ${opp.buyPrice}`);
                        console.log(`Sell on ${opp.sellExchange} at ${opp.sellPrice}`);
                        console.log(`Potential profit: ${opp.profitPercent}%\n`);
                    });
                }
            }
        }, 5000); // Scan every 5 seconds
    }

    private async getPricesAcrossExchanges(pair: string) {
        const prices = [];
        for (const [exchangeName, exchange] of this.exchangeManager.exchanges) {
            try {
                const ticker = await exchange.fetchTicker(pair);
                prices.push({
                    exchange: exchangeName,
                    bid: ticker.bid,
                    ask: ticker.ask
                });
            } catch (error) {
                // Skip if pair not available on this exchange
                continue;
            }
        }
        return prices;
    }

    private findArbitrageOpportunities(prices: any[]) {
        const opportunities = [];
        for (let i = 0; i < prices.length; i++) {
            for (let j = i + 1; j < prices.length; j++) {
                const buyPrice = prices[i].ask;
                const sellPrice = prices[j].bid;
                
                const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
                
                if (profitPercent > config.minProfitPercent) {
                    opportunities.push({
                        buyExchange: prices[i].exchange,
                        sellExchange: prices[j].exchange,
                        buyPrice,
                        sellPrice,
                        profitPercent
                    });
                }
                
                // Check reverse direction
                const reverseProfitPercent = ((prices[i].bid - prices[j].ask) / prices[j].ask) * 100;
                if (reverseProfitPercent > config.minProfitPercent) {
                    opportunities.push({
                        buyExchange: prices[j].exchange,
                        sellExchange: prices[i].exchange,
                        buyPrice: prices[j].ask,
                        sellPrice: prices[i].bid,
                        profitPercent: reverseProfitPercent
                    });
                }
            }
        }
        return opportunities;
    }
}
