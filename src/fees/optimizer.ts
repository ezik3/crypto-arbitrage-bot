
import { ethers } from 'ethers';
import { GasOptimizer } from '../utils/gasOptimizer';

export class FeeOptimizer {
    private gasOptimizer: GasOptimizer;

    async calculateOptimalFees(
        route: any,
        expectedProfit: number
    ) {
        const baseGas = await this.gasOptimizer.calculateOptimalGas();
        const maxFee = this.calculateMaxAcceptableFee(expectedProfit);
        
        return {
            maxFeePerGas: baseGas.maxFeePerGas,
            maxPriorityFeePerGas: this.calculatePriorityFee(baseGas, maxFee),
            estimatedProfit: expectedProfit - maxFee
        };
    }
}
