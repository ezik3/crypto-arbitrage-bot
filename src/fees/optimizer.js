"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeOptimizer = void 0;
const ethers_1 = require("ethers");
const gasOptimizer_1 = require("../utils/gasOptimizer");
class FeeOptimizer {
    constructor(provider) {
        this.gasOptimizer = new gasOptimizer_1.GasOptimizer();
        this.provider = provider !== null && provider !== void 0 ? provider : new ethers_1.ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
    }
    async calculateOptimalFees(params) {
        const { expectedProfit, ethPriceUsd = 2000, gasLimit = 300000 } = params;
        const gasEstimate = await this.gasOptimizer.calculateOptimalGas(this.provider, ethPriceUsd, gasLimit);
        const maxFee = this.calculateMaxAcceptableFee(expectedProfit);
        const estimatedProfit = expectedProfit - gasEstimate.estimatedCostUsd;
        return {
            maxFeePerGas: gasEstimate.maxFeePerGas,
            maxPriorityFeePerGas: this.calculatePriorityFee(gasEstimate.maxPriorityFeePerGas, maxFee),
            estimatedGasUsd: gasEstimate.estimatedCostUsd,
            estimatedProfit,
            isProfitable: estimatedProfit > 0
        };
    }
    calculateMaxAcceptableFee(expectedProfit) {
        // Never spend more than 50% of expected profit on gas
        return expectedProfit * 0.5;
    }
    calculatePriorityFee(basePriority, maxFeeUsd) {
        // Cap priority fee if it would consume too much profit
        const capGwei = Math.min(5, maxFeeUsd * 10); // rough heuristic
        const cap = ethers_1.ethers.utils.parseUnits(capGwei.toFixed(2), 'gwei');
        return basePriority.lt(cap) ? basePriority : cap;
    }
}
exports.FeeOptimizer = FeeOptimizer;
