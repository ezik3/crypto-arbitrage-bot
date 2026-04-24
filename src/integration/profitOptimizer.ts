
import { ProfitCalculator } from '../utils/profitCalculator';
import { GasOptimizer } from '../utils/gasOptimizer';
import { providers } from 'ethers';

export class ProfitOptimizer {
    private profitCalculator: ProfitCalculator;
    private gasOptimizer: GasOptimizer;

    constructor() {
        this.profitCalculator = new ProfitCalculator();
        this.gasOptimizer = new GasOptimizer();
    }

    async calculateOptimalExecution(route: any, amount: string) {
        // Provide a minimal provider; if ETH_RPC_URL is unset, gas defaults apply
        const rpcUrl = (typeof process !== 'undefined' ? process.env.ETH_RPC_URL : '') || '';
        const provider = new providers.JsonRpcProvider(rpcUrl || undefined);

        const gasEstimate = await this.gasOptimizer.calculateOptimalGas(provider);
        const gasPriceGwei = parseFloat(gasEstimate.gasPrice.toString()) / 1e9;

        const expectedProfit = this.profitCalculator.calculateNetProfit(
            route.expectedReturn ?? 0,
            gasPriceGwei,
            route.gasEstimate ?? 300_000,
            this.calculateFlashLoanFee(amount)
        );

        return {
            profitable: expectedProfit > 0,
            expectedProfit,
            optimalGasPrice: gasEstimate.gasPrice
        };
    }

    private calculateFlashLoanFee(amount: string): number {
        const amountNum = parseFloat(amount) || 0;
        return amountNum * 0.0009; // Aave V2: 0.09%
    }
}
