"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitTracker = void 0;
class ProfitTracker {
    constructor() {
        this.profitHistory = [];
    }
    async trackProfit(profit, token) {
        this.profitHistory.push({
            timestamp: Date.now(),
            profit,
            token
        });
        return this.calculateMetrics();
    }
}
exports.ProfitTracker = ProfitTracker;
