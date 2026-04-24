"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitCalculator = void 0;
class ProfitCalculator {
    calculateNetProfit(grossProfit, gasPrice, estimatedGas, flashLoanFee) {
        const gasCost = gasPrice * estimatedGas;
        const totalFees = gasCost + flashLoanFee;
        return grossProfit - totalFees;
    }
}
exports.ProfitCalculator = ProfitCalculator;
