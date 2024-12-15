import { ExchangeManager } from './exchanges/exchangeManager';

type ValidPairs = {
    [exchange: string]: {
        [key in 'USDT' | 'BTC' | 'ETH']?: string[];
    };
};

export class TriangularArbitrage {
    private readonly minProfitPercent: number = 0.5;
    private exchangeManager: ExchangeManager;

    // Define valid pairs for each exchange
    private readonly validPairs: ValidPairs = {
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

    constructor(exchangeManager: ExchangeManager) {
        this.exchangeManager = exchangeManager;
    }

    async findTriangularOpportunities(exchange: string, baseAsset: 'USDT' | 'BTC' | 'ETH' = 'USDT'): Promise<void> {
        console.log(`\n📊 Scanning ${exchange.toUpperCase()} for triangular opportunities...`);
        console.log(`   Scanning ${baseAsset}...`);

        const exchangePairs = this.validPairs[exchange]?.[baseAsset] || [];
        if (!exchangePairs.length) {
            console.log(`   No valid pairs found for ${exchange} with ${baseAsset}`);
            return;
        }

        const triangles = this.getValidTriangles(exchange, baseAsset);
        
        for (const triangle of triangles) {
            try {
                const rates = await this.fetchTriangleRates(exchange, triangle);
                const profit = this.calculateTriangularProfit(rates);
                
                if (profit > this.minProfitPercent) {
                    console.log('\n💰 Triangular Opportunity Found:');
                    console.log(`🔄 Path: ${triangle.join(' -> ')}`);
                    console.log(`📈 Profit: ${profit.toFixed(2)}%`);
                    console.log(`⚡ Exchange: ${exchange}`);
                    console.log(`💱 Base Asset: ${baseAsset}\n`);
                }
            } catch (error) {
                // Silently skip invalid pairs
                continue;
            }
        }
        console.log('✓');
    }

    private getValidTriangles(exchange: string, baseAsset: 'USDT' | 'BTC' | 'ETH'): string[][] {
        const triangles: string[][] = [];
        const exchangePairs = this.validPairs[exchange]?.[baseAsset] || [];
        
        for (const firstPair of exchangePairs) {
            const [token1] = firstPair.split('/');
            if (token1 && this.validPairs[exchange]?.[token1 as 'BTC' | 'ETH']) {
                const secondPairs = this.validPairs[exchange][token1 as 'BTC' | 'ETH'] || [];
                
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

    private async fetchTriangleRates(exchange: string, triangle: string[]): Promise<number[]> {
        const rates: number[] = [];
        for (const pair of triangle) {
            const rate = await this.exchangeManager.fetchPrice(exchange, pair);
            if (rate <= 0) {
                throw new Error(`Invalid rate for ${pair}`);
            }
            rates.push(rate);
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
