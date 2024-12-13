
export class ProfitCalculator {
    calculateNetProfit(
        grossProfit: number,
        gasPrice: number,
        estimatedGas: number,
        flashLoanFee: number
    ): number {
        const gasCost = gasPrice * estimatedGas;
        const totalFees = gasCost + flashLoanFee;
        return grossProfit - totalFees;
    }
}
