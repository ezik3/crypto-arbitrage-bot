  export class TriangularArbitrage {
    private readonly minProfitPercent: number = 0.5;
    private exchangeManager: ExchangeManager;

    constructor(exchangeManager: ExchangeManager) {
        this.exchangeManager = exchangeManager;
    }

    async findTriangularOpportunities(exchange: string, baseAsset: string = 'USDT'): Promise<void> {
          const triangles = [
              // BTC based triangles
              [`BTC/${baseAsset}`, 'ETH/BTC', `ETH/${baseAsset}`],
              [`BTC/${baseAsset}`, 'SOL/BTC', `SOL/${baseAsset}`],
              [`BTC/${baseAsset}`, 'XRP/BTC', `XRP/${baseAsset}`],
              [`BTC/${baseAsset}`, 'ADA/BTC', `ADA/${baseAsset}`],
              [`BTC/${baseAsset}`, 'DOGE/BTC', `DOGE/${baseAsset}`],
              [`BTC/${baseAsset}`, 'DOT/BTC', `DOT/${baseAsset}`],
              [`BTC/${baseAsset}`, 'MATIC/BTC', `MATIC/${baseAsset}`],
              [`BTC/${baseAsset}`, 'LINK/BTC', `LINK/${baseAsset}`],
              [`BTC/${baseAsset}`, 'AVAX/BTC', `AVAX/${baseAsset}`],
              [`BTC/${baseAsset}`, 'UNI/BTC', `UNI/${baseAsset}`],
              [`BTC/${baseAsset}`, 'ATOM/BTC', `ATOM/${baseAsset}`],
              [`BTC/${baseAsset}`, 'LTC/BTC', `LTC/${baseAsset}`],
              [`BTC/${baseAsset}`, 'OP/BTC', `OP/${baseAsset}`],
              [`BTC/${baseAsset}`, 'ARB/BTC', `ARB/${baseAsset}`],
              [`BTC/${baseAsset}`, 'NEAR/BTC', `NEAR/${baseAsset}`],
              [`BTC/${baseAsset}`, 'FTM/BTC', `FTM/${baseAsset}`],
              [`BTC/${baseAsset}`, 'AAVE/BTC', `AAVE/${baseAsset}`],
              [`BTC/${baseAsset}`, 'SUI/BTC', `SUI/${baseAsset}`],
              [`BTC/${baseAsset}`, 'APT/BTC', `APT/${baseAsset}`],
              [`BTC/${baseAsset}`, 'INJ/BTC', `INJ/${baseAsset}`],

              // ETH based triangles
              [`ETH/${baseAsset}`, 'LINK/ETH', `LINK/${baseAsset}`],
              [`ETH/${baseAsset}`, 'UNI/ETH', `UNI/${baseAsset}`],
              [`ETH/${baseAsset}`, 'AAVE/ETH', `AAVE/${baseAsset}`],
              [`ETH/${baseAsset}`, 'MATIC/ETH', `MATIC/${baseAsset}`],
              [`ETH/${baseAsset}`, 'CRV/ETH', `CRV/${baseAsset}`],
              [`ETH/${baseAsset}`, 'SNX/ETH', `SNX/${baseAsset}`],
              [`ETH/${baseAsset}`, 'COMP/ETH', `COMP/${baseAsset}`],
              [`ETH/${baseAsset}`, 'FTM/ETH', `FTM/${baseAsset}`],
              [`ETH/${baseAsset}`, 'SAND/ETH', `SAND/${baseAsset}`],
              [`ETH/${baseAsset}`, 'MANA/ETH', `MANA/${baseAsset}`],
              [`ETH/${baseAsset}`, 'GRT/ETH', `GRT/${baseAsset}`],
              [`ETH/${baseAsset}`, 'IMX/ETH', `IMX/${baseAsset}`],
              [`ETH/${baseAsset}`, 'BLUR/ETH', `BLUR/${baseAsset}`],
              [`ETH/${baseAsset}`, 'GALA/ETH', `GALA/${baseAsset}`],
              [`ETH/${baseAsset}`, 'FET/ETH', `FET/${baseAsset}`],
              [`ETH/${baseAsset}`, 'ROSE/ETH', `ROSE/${baseAsset}`],
              [`ETH/${baseAsset}`, 'CHZ/ETH', `CHZ/${baseAsset}`],
              [`ETH/${baseAsset}`, 'ENJ/ETH', `ENJ/${baseAsset}`],
              [`ETH/${baseAsset}`, 'BAT/ETH', `BAT/${baseAsset}`],
              [`ETH/${baseAsset}`, 'OCEAN/ETH', `OCEAN/${baseAsset}`],

              // SOL based triangles
              [`SOL/${baseAsset}`, 'RAY/SOL', `RAY/${baseAsset}`],
              [`SOL/${baseAsset}`, 'SRM/SOL', `SRM/${baseAsset}`],
              [`SOL/${baseAsset}`, 'MATIC/SOL', `MATIC/${baseAsset}`],
              [`SOL/${baseAsset}`, 'AVAX/SOL', `AVAX/${baseAsset}`],
              [`SOL/${baseAsset}`, 'FTM/SOL', `FTM/${baseAsset}`],

              // BNB based triangles
              [`BNB/${baseAsset}`, 'CAKE/BNB', `CAKE/${baseAsset}`],
              [`BNB/${baseAsset}`, 'MATIC/BNB', `MATIC/${baseAsset}`],
              [`BNB/${baseAsset}`, 'FTM/BNB', `FTM/${baseAsset}`],
              [`BNB/${baseAsset}`, 'AVAX/BNB', `AVAX/${baseAsset}`],

              // Cross-chain triangles
              [`BTC/${baseAsset}`, 'ETH/BTC', `ETH/${baseAsset}`],
              [`ETH/${baseAsset}`, 'SOL/ETH', `SOL/${baseAsset}`],
              [`BTC/${baseAsset}`, 'SOL/BTC', `SOL/${baseAsset}`],
              [`ETH/${baseAsset}`, 'BNB/ETH', `BNB/${baseAsset}`],
              [`BTC/${baseAsset}`, 'BNB/BTC', `BNB/${baseAsset}`]
          ];

          for (const triangle of triangles) {
              try {
                  const rates = await this.fetchTriangleRates(exchange, triangle);
                  const profit = this.calculateTriangularProfit(rates);
                
                  if (profit > this.minProfitPercent) {
                      console.log(`Triangular Opportunity Found on ${exchange}:`);
                      console.log(`Path: ${triangle.join(' -> ')}`);
                      console.log(`Profit: ${profit.toFixed(2)}%`);
                  }
              } catch (error) {
                  continue;
              }
          }
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

import { ExchangeManager } from './exchanges';
