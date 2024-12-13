
export class ProfitMetrics {
    calculateProfitMetrics(trades: any[]) {
        return {
            totalProfit: this.calculateTotal(trades),
            averageProfit: this.calculateAverage(trades),
            profitTrend: this.analyzeTrend(trades),
            bestPerformingPairs: this.findBestPairs(trades)
        };
    }
}
