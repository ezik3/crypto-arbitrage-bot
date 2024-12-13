  import Binance from 'binance-api-node';
  const KucoinAPI = require('kucoin-node-api') as any;
  import { LinearClient } from 'bybit-api';

  export class ExchangeManager {
      private binanceClient: ReturnType<typeof Binance> = Binance();
      private kucoinClient: any;
      private bybitClient: LinearClient = new LinearClient();
    
      private tradingPairs = [
          'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'
      ];

      constructor() {
          this.initializeClients();
      }

      private initializeClients() {
          this.binanceClient = Binance({
              apiKey: process.env.BINANCE_API_KEY,
              apiSecret: process.env.BINANCE_API_SECRET
          });

          KucoinAPI.init({
              apiKey: process.env.KUCOIN_API_KEY,
              secretKey: process.env.KUCOIN_API_SECRET,
              passphrase: process.env.KUCOIN_API_PASSPHRASE
          });
          this.kucoinClient = KucoinAPI;

          this.bybitClient = new LinearClient({
              key: process.env.BYBIT_API_KEY,
              secret: process.env.BYBIT_API_SECRET
          });
      }

      public async initialize(): Promise<void> {
          this.initializeClients();
      
          // Test connections
          await this.binanceClient.ping();
          console.log('✅ Binance connected');
      
          // Add connection tests for other exchanges
          console.log('✅ All exchanges initialized');
      }

      private async fetchBinancePrices(prices: Record<string, number>) {
          const binancePrice = await this.binanceClient.prices();
          Object.keys(binancePrice).forEach(symbol => {
              prices[`Binance_${symbol}`] = parseFloat(binancePrice[symbol]);
          });
          return prices;
      }

      private async fetchKucoinPrices(prices: Record<string, number>) {
          const kucoinPrices = await this.kucoinClient.getAllTickers();
          kucoinPrices.data.ticker.forEach((ticker: any) => {
              prices[`Kucoin_${ticker.symbol}`] = parseFloat(ticker.last);
          });
          return prices;
      }

      private async fetchBybitPrices(prices: Record<string, number>) {
          const tickers = await this.bybitClient.getTickers();
          tickers.result.forEach((ticker: any) => {
              prices[`Bybit_${ticker.symbol}`] = parseFloat(ticker.last_price);
          });
          return prices;
      }

      private detectTriangularOpportunities(prices: Record<string, number>) {
          // Implement triangular arbitrage detection logic
          return prices;
      }

      public async fetchAllPrices(symbol: string): Promise<Record<string, number>> {
          const prices: Record<string, number> = {};
      
          await Promise.all([
              this.fetchBinancePrices(prices),
              this.fetchKucoinPrices(prices),
              this.fetchBybitPrices(prices)
          ]);

          this.detectTriangularOpportunities(prices);
      
          return prices;
      }
  }