  import { ProfitManager } from '../profit/profitManager';
  import { MarketImpactAnalyzer } from '../market/impactAnalyzer';
  import { OrderManager } from '../orders/orderManager';
  import { ExchangeManager } from '../exchanges/exchangeManager';
  import { FlashLoanManager } from '../defi/flashLoanManager';

  export class ArbitrageOrchestrator {
      private profitManager: ProfitManager;
      private marketAnalyzer: MarketImpactAnalyzer;
      private orderManager: OrderManager;
      private exchangeManager: ExchangeManager;
      private flashLoanManager: FlashLoanManager;

      constructor() {
          this.profitManager = new ProfitManager();
          this.marketAnalyzer = new MarketImpactAnalyzer();
          this.orderManager = new OrderManager();
          this.exchangeManager = new ExchangeManager();
          this.flashLoanManager = new FlashLoanManager();
      }

      public async initialize(): Promise<void> {
          await this.exchangeManager.initialize();
          console.log('Arbitrage system initialized');
      }
      private lastOpportunity: string = '';
      private lastFlashLoan: string = '';

      public async startArbitrageLoop(): Promise<void> {
          while (true) {
              const marketData = await this.marketAnalyzer.analyzeMarketImpact({
                  timeframe: '1m',
                  minProfit: 0.5
              });

              const flashLoanOpps = await this.flashLoanManager.findFlashLoanOpportunities();
            
              // Only show new opportunities
              const currentOpp = JSON.stringify(marketData.opportunities);
              const currentFlash = JSON.stringify(flashLoanOpps);

              if (currentOpp !== this.lastOpportunity) {
                  console.log('\n💰 New Arbitrage Opportunity Found:');
                  console.log(marketData.opportunities);
                  this.lastOpportunity = currentOpp;
              }

              if (currentFlash !== this.lastFlashLoan) {
                  console.log('\n🚀 New Flash Loan Opportunity:');
                  console.log(flashLoanOpps);
                  this.lastFlashLoan = currentFlash;
              }

              await new Promise(resolve => setTimeout(resolve, 1000));
          }
      }
  }