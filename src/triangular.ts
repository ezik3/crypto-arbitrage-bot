import { ExchangeManager } from './exchanges';

export class TriangularArbitrage {
    private readonly minProfitPercent: number = 0.5;
    private exchangeManager: ExchangeManager;

    constructor(exchangeManager: ExchangeManager) {
        this.exchangeManager = exchangeManager;
    }

    async findTriangularOpportunities(exchange: string, baseAsset: string = 'USDT'): Promise<void> {
        // Define multiple base assets
        const baseAssets = [
            baseAsset,    // Default (USDT)
            'USDC',
            'BUSD',
            'DAI',
            'EUR',
            'GBP',
            'BTC',
            'ETH'
        ];

        // Combine static and dynamic triangles
        let allTriangles: string[][] = [];

        // Add existing static triangles for each base asset
        for (const base of baseAssets) {
            const staticTriangles = this.getStaticTriangles(base);
            allTriangles = [...allTriangles, ...staticTriangles];
        }

        // Add dynamically generated triangles
        for (const base of baseAssets) {
            const dynamicTriangles = this.generateDynamicTriangles(base);
            allTriangles = [...allTriangles, ...dynamicTriangles];
        }

        // Process all triangles
        for (const triangle of allTriangles) {
            try {
                const rates = await this.fetchTriangleRates(exchange, triangle);
                const profit = this.calculateTriangularProfit(rates);
                
                if (profit > this.minProfitPercent) {
                    console.log(`💰 Triangular Opportunity Found on ${exchange}:`);
                    console.log(`🔄 Path: ${triangle.join(' -> ')}`);
                    console.log(`📈 Profit: ${profit.toFixed(2)}%`);
                    console.log(`⚡ Base Asset: ${triangle[0].split('/')[1]}\n`);
                }
            } catch (error) {
                continue;
            }
        }
    }

    private generateDynamicTriangles(baseAsset: string): string[][] {
        const majorCoins = [
            'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'MATIC',
            'AVAX', 'DOT', 'LINK', 'UNI', 'AAVE', 'ATOM', 'FTM'
        ];
        
        const defiTokens = [
            'UNI', 'AAVE', 'SUSHI', 'CRV', 'SNX', 'COMP', '1INCH',
            'YFI', 'MKR', 'BAL', 'PERP', 'DYDX', 'GMX'
        ];

        const dynamicTriangles: string[][] = [];

        // Generate major coin triangles
        for (const coin1 of majorCoins) {
            for (const coin2 of majorCoins) {
                if (coin1 !== coin2) {
                    dynamicTriangles.push([
                        `${coin1}/${baseAsset}`,
                        `${coin2}/${coin1}`,
                        `${coin2}/${baseAsset}`
                    ]);
                }
            }
        }

        // Generate DeFi token triangles
        for (const defi1 of defiTokens) {
            for (const defi2 of defiTokens) {
                if (defi1 !== defi2) {
                    dynamicTriangles.push([
                        `${defi1}/${baseAsset}`,
                        `${defi2}/${defi1}`,
                        `${defi2}/${baseAsset}`
                    ]);
                }
            }
        }

        // Generate mixed triangles (major coins with DeFi tokens)
        for (const major of majorCoins) {
            for (const defi of defiTokens) {
                dynamicTriangles.push([
                    `${major}/${baseAsset}`,
                    `${defi}/${major}`,
                    `${defi}/${baseAsset}`
                ]);
            }
        }

        return dynamicTriangles;
    }

    private getStaticTriangles(baseAsset: string): string[][] {
        // Your existing static triangles array here
        return [
            // ... all your existing triangles ...
        ];
    }

    private async fetchTriangleRates(exchange: string, triangle: string[]): Promise<number[]> {
        const rates: number[] = [];
        for (const pair of triangle) {
            try {
                const rate = await this.exchangeManager.fetchPrice(exchange, pair);
                rates.push(rate);
            } catch (error) {
                throw new Error(`Failed to fetch rate for ${pair}`);
            }
        }
        return rates;
    }

    private calculateTriangularProfit(rates: number[]): number {
        if (rates.length !== 3) return 0;
        
        const initialAmount = 1000; // Example starting amount
        const firstTrade = initialAmount / rates[0];
        const secondTrade = firstTrade * rates[1];
        const finalAmount = secondTrade * rates[2];
        
        return ((finalAmount - initialAmount) / initialAmount) * 100;
    }
}
