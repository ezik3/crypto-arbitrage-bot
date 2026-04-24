"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const arbitrageOrchestrator_1 = require("../core/arbitrageOrchestrator");
dotenv_1.default.config();
async function runSimulation() {
    console.log('Starting arbitrage simulation with real exchange data...');
    const orchestrator = new arbitrageOrchestrator_1.ArbitrageOrchestrator();
    await orchestrator.initialize();
    setInterval(async () => {
        try {
            const opportunities = await orchestrator.scanAllOpportunities();
            opportunities.forEach((opp) => {
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
        }
        catch (error) {
            console.error('Error in simulation:', error);
        }
    }, 1000);
}
runSimulation().catch(console.error);
