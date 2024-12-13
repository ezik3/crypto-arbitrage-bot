
export class FeeCalculator {
    calculateTotalFees(
        gasPrice: number,
        gasLimit: number,
        flashLoanFee: number,
        dexFees: number[]
    ) {
        const gasCost = gasPrice * gasLimit;
        const totalDexFees = dexFees.reduce((a, b) => a + b, 0);
        
        return {
            total: gasCost + flashLoanFee + totalDexFees,
            breakdown: {
                gas: gasCost,
                flashLoan: flashLoanFee,
                dex: totalDexFees
            }
        };
    }
}
