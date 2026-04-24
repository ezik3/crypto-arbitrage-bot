"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasOptimizer = void 0;
const ethers_1 = require("ethers");
class GasOptimizer {
    /**
     * Calculate the optimal gas parameters from the current network state.
     * @param provider - connected ethers provider
     * @param ethPriceUsd - current ETH price in USD for cost estimation
     * @param gasLimit - estimated gas units for the transaction (default 300_000)
     */
    async calculateOptimalGas(provider, ethPriceUsd = 2000, gasLimit = 300000) {
        var _a, _b, _c, _d;
        const feeData = await provider.getFeeData();
        // EIP-1559 support
        const maxFeePerGas = (_b = (_a = feeData.maxFeePerGas) !== null && _a !== void 0 ? _a : feeData.gasPrice) !== null && _b !== void 0 ? _b : ethers_1.ethers.utils.parseUnits('30', 'gwei');
        const maxPriorityFeePerGas = (_c = feeData.maxPriorityFeePerGas) !== null && _c !== void 0 ? _c : ethers_1.ethers.utils.parseUnits('2', 'gwei');
        const gasPrice = (_d = feeData.gasPrice) !== null && _d !== void 0 ? _d : maxFeePerGas;
        const totalGasWei = gasPrice.mul(gasLimit);
        const estimatedCostEth = parseFloat(ethers_1.ethers.utils.formatEther(totalGasWei));
        const estimatedCostUsd = estimatedCostEth * ethPriceUsd;
        return {
            gasPrice,
            maxFeePerGas,
            maxPriorityFeePerGas,
            estimatedCostEth,
            estimatedCostUsd
        };
    }
    optimizeGasPrice(gasPrice, baseFee) {
        if (!baseFee)
            return gasPrice;
        // Add a 10% tip above base fee for faster inclusion
        return baseFee.mul(110).div(100);
    }
}
exports.GasOptimizer = GasOptimizer;
