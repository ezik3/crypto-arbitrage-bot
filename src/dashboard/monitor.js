"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMonitor = void 0;
class DashboardMonitor {
    constructor() {
        this.metrics = new Map();
    }
    async trackMetrics() {
        const data = {
            profits: await this.getProfitMetrics(),
            gas: await this.getGasMetrics(),
            transactions: await this.getTransactionMetrics(),
            performance: await this.getPerformanceMetrics()
        };
        this.updateDashboard(data);
    }
}
exports.DashboardMonitor = DashboardMonitor;
