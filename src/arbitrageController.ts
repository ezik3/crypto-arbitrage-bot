  import { FlashLoanManager } from './flashloan';
  import { TriangularArbitrage } from './triangular';
  import { RouteExecutor } from './integration/routeExecutor';
  import { ProfitOptimizer } from './integration/profitOptimizer';

  export class ArbitrageController {
      private flashLoanManager: FlashLoanManager;
      private triangularArbitrage: TriangularArbitrage;
      private isRunning: boolean = false;
      private routeExecutor: RouteExecutor;
      private profitOptimizer: ProfitOptimizer;

      constructor(privateKey: string) {
          this.flashLoanManager = new FlashLoanManager(privateKey);
          this.triangularArbitrage = new TriangularArbitrage();
          this.routeExecutor = new RouteExecutor();
          this.profitOptimizer = new ProfitOptimizer();
      }

      async start() {
          this.isRunning = true;
          while (this.isRunning) {
              try {
                  // Check triangular opportunities
                  const triangularOpp = await this.triangularArbitrage.findOpportunity();
                
                  // Check flash loan opportunities
                  const flashLoanOpp = await this.flashLoanManager.checkArbitrageOpportunity(
                      "TOKEN_ADDRESS",
                      "1000000000000000000" // 1 ETH
                  );

                  if (triangularOpp.profitable) {
                      await this.executeArbitrage(triangularOpp.tokenIn, triangularOpp.amount);
                  }

                  if (flashLoanOpp.profitable) {
                      await this.executeArbitrage(flashLoanOpp.tokenIn, flashLoanOpp.amount);
                  }

                  // Add delay to prevent rate limiting
                  await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (error) {
                  console.error('Error in arbitrage loop:', error);
              }
          }
      }

      async executeArbitrage(tokenIn: string, amount: string) {
          const route = await this.routeExecutor.executeOptimalRoute(
              tokenIn,
              tokenIn,  // Same token for arbitrage
              amount
          );

          const profitAnalysis = await this.profitOptimizer.calculateOptimalExecution(
              route,
              amount
          );

          if (profitAnalysis.profitable) {
              return this.executeTrade(route, profitAnalysis.optimalGasPrice);
          }
      }
  }
