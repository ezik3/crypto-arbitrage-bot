import dotenv from 'dotenv';
import { ArbitrageOrchestrator } from '../core/arbitrageOrchestrator';

dotenv.config();

async function runSimulation() {
    console.log('Starting arbitrage simulation with real exchange data...');
  
    const orchestrator = new ArbitrageOrchestrator();
    await orchestrator.initialize();
  
    setInterval(async () => {
        try {
            const opportunities = await orchestrator.scanAllOpportunities();
          
            opportunities.forEach((opp: any) => {
                if (opp.profit > 0.5) {
                    console.log(`
                    💰 Arbitrage Opportunity Found:
                    Pair: ${opp.pair}
                    Profit: ${opp.profit.toFixed(2)}%
                    Buy Exchange: ${opp.buyExchange}
                    Sell Exchange: ${opp.sellExchange}
                    Buy Price: ${opp.buyPrice}
                    Sell Price: ${opp.sellPrice}
                    `);
                }
            });
        } catch (error) {
            console.error('Error in simulation:', error);
        }
    }, 1000);
}

runSimulation().catch(console.error);