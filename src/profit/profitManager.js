"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitManager = void 0;
const calculator_1 = require("../fees/calculator");
class ProfitManager {
    constructor() {
        this.profitMetrics = new Map();
        this.feeCalculator = new calculator_1.FeeCalculator();
        this.MIN_NET_PROFIT_USD = 0.20; // $0.20 minimum net profit
    }
    async analyzeProfitability(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            const grossProfitUsd = (params.profit / 100) * params.volume;
            const asset = (_c = (_b = (_a = params.pair) === null || _a === void 0 ? void 0 : _a.split('/')) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : 'USDT';
            const fees = this.feeCalculator.calculateTotalFees({
                tradeAmountUsd: params.volume,
                buyExchange: (_d = params.buyExchange) !== null && _d !== void 0 ? _d : 'binance',
                sellExchange: (_e = params.sellExchange) !== null && _e !== void 0 ? _e : 'binance',
                asset,
                assetPriceUsd: (_f = params.assetPriceUsd) !== null && _f !== void 0 ? _f : 1,
                gasUsd: (_g = params.gasUsd) !== null && _g !== void 0 ? _g : 0,
                flashLoanFeeRate: (_h = params.flashLoanFeeRate) !== null && _h !== void 0 ? _h : 0
            });
            const netProfitUsd = grossProfitUsd - fees.total;
            const netProfitPercent = params.volume > 0 ? (netProfitUsd / params.volume) * 100 : 0;
            const isProfitable = netProfitUsd >= this.MIN_NET_PROFIT_USD;
            const result = {
                isProfitable,
                grossProfitUsd,
                totalFeesUsd: fees.total,
                netProfitUsd,
                netProfitPercent,
                breakdown: {
                    grossUsd: grossProfitUsd,
                    buyFeeUsd: fees.buyFee,
                    sellFeeUsd: fees.sellFee,
                    withdrawalFeeUsd: fees.withdrawalFee,
                    gasUsd: fees.gas,
                    flashLoanFeeUsd: fees.flashLoan
                }
            };
            // Store for trend tracking
            this.profitMetrics.set(params.pair, result);
            return result;
        }
        catch (error) {
            console.error('Error analyzing profitability:', error);
            return {
                isProfitable: false,
                grossProfitUsd: 0,
                totalFeesUsd: 0,
                netProfitUsd: 0,
                netProfitPercent: 0,
                breakdown: { grossUsd: 0, buyFeeUsd: 0, sellFeeUsd: 0, withdrawalFeeUsd: 0, gasUsd: 0, flashLoanFeeUsd: 0 }
            };
        }
    }
    /**
     * Rank a set of opportunities by net profit and return the top ones.
     */
    rankOpportunities(opportunities, limit = 5) {
        return opportunities
            .sort((a, b) => b.profit - a.profit)
            .slice(0, limit);
    }
    async optimizeProfits() {
        const analysis = this.analyzeProfitOpportunities();
        return {
            strategies: this.rankStrategies(),
            execution: this.planProfitExecution(),
            monitoring: this.setupProfitMonitoring()
        };
    }
    analyzeProfitOpportunities() {
        const metrics = Array.from(this.profitMetrics.values());
        const avgProfit = metrics.length
            ? metrics.reduce((s, m) => { var _a; return s + ((_a = m.netProfitPercent) !== null && _a !== void 0 ? _a : 0); }, 0) / metrics.length
            : 0;
        return { potentialProfit: avgProfit, risk: 'LOW', confidence: 0.85 };
    }
    rankStrategies() {
        return {
            bestStrategy: 'CROSS_EXCHANGE',
            expectedReturn: 1.2,
            reliability: 0.9
        };
    }
    planProfitExecution() {
        return {
            steps: ['SCAN', 'VALIDATE', 'EXECUTE'],
            timing: 'IMMEDIATE',
            priority: 'HIGH'
        };
    }
    setupProfitMonitoring() {
        return {
            alerts: true,
            thresholds: { min: 0.5, target: 1.0 },
            reporting: 'REAL_TIME'
        };
    }
}
exports.ProfitManager = ProfitManager;
