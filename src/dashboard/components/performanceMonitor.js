"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
class PerformanceMonitor {
    async monitorSystemPerformance() {
        return {
            executionSpeed: await this.measureExecutionSpeed(),
            successRate: this.calculateSuccessRate(),
            gasEfficiency: await this.measureGasEfficiency(),
            profitability: this.calculateProfitability()
        };
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
