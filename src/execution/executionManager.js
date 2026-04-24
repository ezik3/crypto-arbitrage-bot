"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionManager = void 0;
const orderManager_1 = require("../orders/orderManager");
const riskManager_1 = require("../risk/riskManager");
const calculator_1 = require("../fees/calculator");
const exchangeManager_1 = require("../exchanges/exchangeManager");
class ExecutionManager {
    constructor(exchangeManager) {
        this.executionQueue = new Map();
        // Dry-run mode: if true, log trades but don't submit real orders
        this.DRY_RUN = process.env.DRY_RUN !== 'false';
        const em = exchangeManager !== null && exchangeManager !== void 0 ? exchangeManager : new exchangeManager_1.ExchangeManager();
        this.orderManager = new orderManager_1.OrderManager(em);
        this.riskManager = new riskManager_1.RiskManager();
        this.feeCalculator = new calculator_1.FeeCalculator();
    }
    async executeStrategy(strategy) {
        const start = Date.now();
        // 1. Risk check
        const risk = await this.riskManager.evaluateRisk({
            pair: strategy.pair,
            profitPercent: strategy.profitPercent,
            tradeSize: strategy.tradeAmountUsd,
            totalCapital: strategy.capitalUsd,
            exchange: strategy.buyExchange
        });
        if (!risk.approved) {
            console.warn(`⚠️  Risk check blocked trade on ${strategy.pair}: ${risk.reasons.join(', ')}`);
            return { success: false, strategy: strategy.type, netProfitUsd: 0, durationMs: Date.now() - start, details: risk };
        }
        // 2. Fee check
        const asset = strategy.pair.split('/')[0];
        const fees = this.feeCalculator.calculateTotalFees({
            tradeAmountUsd: strategy.tradeAmountUsd,
            buyExchange: strategy.buyExchange,
            sellExchange: strategy.sellExchange,
            asset,
            assetPriceUsd: strategy.buyPrice
        });
        const grossProfitUsd = (strategy.profitPercent / 100) * strategy.tradeAmountUsd;
        const netProfitUsd = grossProfitUsd - fees.total;
        if (netProfitUsd <= 0) {
            console.log(`💸 Trade on ${strategy.pair} unprofitable after fees (net: $${netProfitUsd.toFixed(4)})`);
            return { success: false, strategy: strategy.type, netProfitUsd, durationMs: Date.now() - start, details: fees };
        }
        // 3. Execute
        if (this.DRY_RUN) {
            console.log(`🔵 [DRY RUN] Would execute ${strategy.type} on ${strategy.pair}: net profit $${netProfitUsd.toFixed(4)}`);
            return { success: true, strategy: strategy.type, netProfitUsd, durationMs: Date.now() - start, details: { dryRun: true, fees } };
        }
        console.log(`🚀 Executing ${strategy.type} trade on ${strategy.pair}, expected net profit: $${netProfitUsd.toFixed(4)}`);
        const result = await this.orderManager.executeArbitrage({
            symbol: strategy.pair,
            buyExchange: strategy.buyExchange,
            sellExchange: strategy.sellExchange,
            amount: strategy.amount,
            buyPrice: strategy.buyPrice,
            sellPrice: strategy.sellPrice
        });
        return {
            success: result.success,
            strategy: strategy.type,
            netProfitUsd: result.netProfit,
            durationMs: Date.now() - start,
            details: result
        };
    }
    async assessMarketConditions() {
        // Placeholder – in production would query order book depth and recent price variance
        return { liquid: true, volatile: false };
    }
    trackExecutionMetrics() {
        return { executions: this.executionQueue.size };
    }
    optimizeExecution() {
        return { suggestion: 'MAINTAIN_STRATEGY' };
    }
}
exports.ExecutionManager = ExecutionManager;
