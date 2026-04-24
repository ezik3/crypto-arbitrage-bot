"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyzer = void 0;
class PerformanceAnalyzer {
    constructor() {
        this.metricsHistory = new Map();
    }
    async analyzeSystemPerformance() {
        const metrics = {
            execution: await this.analyzeExecutionMetrics(),
            profit: this.analyzeProfitMetrics(),
            gas: await this.analyzeGasUsage(),
            success: this.calculateSuccessRates()
        };
        return this.generatePerformanceReport(metrics);
    }
}
exports.PerformanceAnalyzer = PerformanceAnalyzer;
