"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitOptimizer = void 0;
const profitCalculator_1 = require("../utils/profitCalculator");
const gasOptimizer_1 = require("../utils/gasOptimizer");
const ethers_1 = require("ethers");
class ProfitOptimizer {
    constructor() {
        this.profitCalculator = new profitCalculator_1.ProfitCalculator();
        this.gasOptimizer = new gasOptimizer_1.GasOptimizer();
    }
    async calculateOptimalExecution(route, amount) {
        var _a, _b;
        // Provide a minimal provider; if ETH_RPC_URL is unset, gas defaults apply
        const rpcUrl = (typeof process !== 'undefined' ? process.env.ETH_RPC_URL : '') || '';
        const provider = new ethers_1.providers.JsonRpcProvider(rpcUrl || undefined);
        const gasEstimate = await this.gasOptimizer.calculateOptimalGas(provider);
        const gasPriceGwei = parseFloat(gasEstimate.gasPrice.toString()) / 1e9;
        const expectedProfit = this.profitCalculator.calculateNetProfit((_a = route.expectedReturn) !== null && _a !== void 0 ? _a : 0, gasPriceGwei, (_b = route.gasEstimate) !== null && _b !== void 0 ? _b : 300000, this.calculateFlashLoanFee(amount));
        return {
            profitable: expectedProfit > 0,
            expectedProfit,
            optimalGasPrice: gasEstimate.gasPrice
        };
    }
    calculateFlashLoanFee(amount) {
        const amountNum = parseFloat(amount) || 0;
        return amountNum * 0.0009; // Aave V2: 0.09%
    }
}
exports.ProfitOptimizer = ProfitOptimizer;
