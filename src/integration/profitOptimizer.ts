
import { ProfitCalculator } from '../utils/profitCalculator';
import { GasOptimizer } from '../utils/gasOptimizer';

export class ProfitOptimizer {
    private profitCalculator: ProfitCalculator;
    private gasOptimizer: GasOptimizer;

    async calculateOptimalExecution(route: any, amount: string) {
        const gasPrice = await this.gasOptimizer.calculateOptimalGas();
        const expectedProfit = this.profitCalculator.calculateNetProfit(
            route.expectedReturn,
            gasPrice,
            route.gasEstimate,
            this.calculateFlashLoanFee(amount)
        );

        return {
            profitable: expectedProfit > 0,
            expectedProfit,
            optimalGasPrice: gasPrice
        };
    }
}
