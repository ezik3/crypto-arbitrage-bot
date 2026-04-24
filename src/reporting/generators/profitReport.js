"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitReportGenerator = void 0;
class ProfitReportGenerator {
    async generateProfitReport(timeframe) {
        const trades = await this.fetchTrades(timeframe);
        return {
            totalProfit: this.calculateTotalProfit(trades),
            profitByToken: this.analyzeProfitByToken(trades),
            trends: this.analyzeProfitTrends(trades),
            projections: this.generateProjections(trades)
        };
    }
}
exports.ProfitReportGenerator = ProfitReportGenerator;
