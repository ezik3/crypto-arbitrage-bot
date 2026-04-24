"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityOptimizer = void 0;
class LiquidityOptimizer {
    optimizeRoute(pools, amount, maxSlippage = 0.5) {
        const splitAmounts = this.calculateOptimalSplit(pools, amount);
        return this.generateExecutionPlan(splitAmounts, maxSlippage);
    }
}
exports.LiquidityOptimizer = LiquidityOptimizer;
