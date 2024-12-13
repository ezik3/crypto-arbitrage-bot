  import dotenv from 'dotenv';
  import { ArbitrageOrchestrator } from '../core/arbitrageOrchestrator';

  dotenv.config();

  async function runSimulation() {
      console.log('Starting arbitrage simulation with real exchange data...');
    
      const orchestrator = new ArbitrageOrchestrator();
    
      setInterval(async () => {
          try {
              const opportunities = await orchestrator.findOpportunities();
            
              opportunities.forEach((opp) => {
                  if(opp.expectedProfit > 0.5) {
                      console.log(`
                      💰 Arbitrage Opportunity Found:
                      Pair: ${opp.exchangePair}
                      Profit: ${opp.expectedProfit.toFixed(2)}
                      Required Capital: ${opp.requiredCapital}
                      Flash Loan: ${opp.flashLoanPossible ? '✅' : '❌'}
                      Gas Cost: ${opp.gasCost}
                      `);
                  }
              });
          } catch (error) {
              console.error('Error in simulation:', error);
          }
      }, 1000);
  }

  runSimulation().catch(console.error);