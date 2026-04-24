"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitMetrics = void 0;
class ProfitMetrics {
    calculateProfitMetrics(trades) {
        return {
            totalProfit: this.calculateTotal(trades),
            averageProfit: this.calculateAverage(trades),
            profitTrend: this.analyzeTrend(trades),
            bestPerformingPairs: this.findBestPairs(trades)
        };
    }
}
exports.ProfitMetrics = ProfitMetrics;
