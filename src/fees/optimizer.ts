
import { ethers } from 'ethers';
import { GasOptimizer } from '../utils/gasOptimizer';

export class FeeOptimizer {
    private gasOptimizer: GasOptimizer;

    constructor() {
        this.gasOptimizer = new GasOptimizer();
    }

    async calculateOptimalFees(
        route: any,
        expectedProfit: number
    ) {
        const baseGas = await this.gasOptimizer.calculateOptimalGas(new ethers.providers.JsonRpcProvider());
        const maxFee = this.calculateMaxAcceptableFee(expectedProfit);
        
        return {
            maxFeePerGas: baseGas.maxFeePerGas,
            maxPriorityFeePerGas: this.calculatePriorityFee(baseGas, maxFee),
            estimatedProfit: expectedProfit - maxFee
        };
    }

    calculateMaxAcceptableFee(expectedProfit: number): number { return expectedProfit * 0.1; }
    calculatePriorityFee(baseGas: any, maxFee: number): any { return baseGas.maxFeePerGas; }
}
