"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbitrageController = void 0;
const flashloan_1 = require("./flashloan");
const triangular_1 = require("./triangular");
const routeExecutor_1 = require("./integration/routeExecutor");
const profitOptimizer_1 = require("./integration/profitOptimizer");
class ArbitrageController {
    constructor(privateKey) {
        this.isRunning = false;
        this.flashLoanManager = new flashloan_1.FlashLoanManager(privateKey);
        this.triangularArbitrage = new triangular_1.TriangularArbitrage();
        this.routeExecutor = new routeExecutor_1.RouteExecutor();
        this.profitOptimizer = new profitOptimizer_1.ProfitOptimizer();
    }
    async start() {
        this.isRunning = true;
        while (this.isRunning) {
            try {
                // Check triangular opportunities
                const triangularOpp = await this.triangularArbitrage.findOpportunity();
                // Check flash loan opportunities
                const flashLoanOpp = await this.flashLoanManager.checkArbitrageOpportunity("TOKEN_ADDRESS", "1000000000000000000" // 1 ETH
                );
                if (triangularOpp.profitable) {
                    await this.executeArbitrage(triangularOpp.tokenIn, triangularOpp.amount);
                }
                if (flashLoanOpp.profitable) {
                    await this.executeArbitrage(flashLoanOpp.tokenIn, flashLoanOpp.amount);
                }
                // Add delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                console.error('Error in arbitrage loop:', error);
            }
        }
    }
    async executeArbitrage(tokenIn, amount) {
        const route = await this.routeExecutor.executeOptimalRoute(tokenIn, tokenIn, // Same token for arbitrage
        amount);
        const profitAnalysis = await this.profitOptimizer.calculateOptimalExecution(route, amount);
        if (profitAnalysis.profitable) {
            return this.executeTrade(route, profitAnalysis.optimalGasPrice);
        }
    }
}
exports.ArbitrageController = ArbitrageController;
