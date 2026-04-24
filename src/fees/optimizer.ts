
import { ethers } from 'ethers';
import { GasOptimizer } from '../utils/gasOptimizer';

export class FeeOptimizer {
    private gasOptimizer: GasOptimizer;
    private provider: ethers.providers.JsonRpcProvider;

    constructor(provider?: ethers.providers.JsonRpcProvider) {
        this.gasOptimizer = new GasOptimizer();
        this.provider = provider ?? new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
    }

    async calculateOptimalFees(params: {
        route: any;
        expectedProfit: number;  // in USD
        ethPriceUsd?: number;
        gasLimit?: number;
    }): Promise<{
        maxFeePerGas: ethers.BigNumber;
        maxPriorityFeePerGas: ethers.BigNumber;
        estimatedGasUsd: number;
        estimatedProfit: number;
        isProfitable: boolean;
    }> {
        const { expectedProfit, ethPriceUsd = 2000, gasLimit = 300_000 } = params;

        const gasEstimate = await this.gasOptimizer.calculateOptimalGas(
            this.provider,
            ethPriceUsd,
            gasLimit
        );

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

    private calculateMaxAcceptableFee(expectedProfit: number): number {
        // Never spend more than 50% of expected profit on gas
        return expectedProfit * 0.5;
    }

    private calculatePriorityFee(
        basePriority: ethers.BigNumber,
        maxFeeUsd: number
    ): ethers.BigNumber {
        // Cap priority fee if it would consume too much profit
        const capGwei = Math.min(5, maxFeeUsd * 10); // rough heuristic
        const cap = ethers.utils.parseUnits(capGwei.toFixed(2), 'gwei');
        return basePriority.lt(cap) ? basePriority : cap;
    }
}
