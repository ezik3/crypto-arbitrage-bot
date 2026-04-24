
import { ethers } from 'ethers';
import { OrderManager, ArbitrageExecution } from '../orders/orderManager';
import { RiskManager } from '../risk/riskManager';
import { FeeCalculator } from '../fees/calculator';
import { ExchangeManager } from '../exchanges/exchangeManager';

export interface ExecutionStrategy {
    type: 'cross' | 'triangular' | 'flash';
    pair: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    amount: number;             // in base asset
    tradeAmountUsd: number;
    profitPercent: number;
    capitalUsd: number;         // total available capital
}

export interface ExecutionResult {
    success: boolean;
    strategy: string;
    netProfitUsd: number;
    durationMs: number;
    details: any;
}

export class ExecutionManager {
    private executionQueue: Map<string, any> = new Map();
    private orderManager: OrderManager;
    private riskManager: RiskManager;
    private feeCalculator: FeeCalculator;

    // Dry-run mode: if true, log trades but don't submit real orders
    private readonly DRY_RUN: boolean = process.env.DRY_RUN !== 'false';

    constructor(exchangeManager?: ExchangeManager) {
        const em = exchangeManager ?? new ExchangeManager();
        this.orderManager = new OrderManager(em);
        this.riskManager = new RiskManager();
        this.feeCalculator = new FeeCalculator();
    }

    async executeStrategy(strategy: ExecutionStrategy): Promise<ExecutionResult> {
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

        const result: ArbitrageExecution = await this.orderManager.executeArbitrage({
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

    private async assessMarketConditions(): Promise<{ liquid: boolean; volatile: boolean }> {
        // Placeholder – in production would query order book depth and recent price variance
        return { liquid: true, volatile: false };
    }

    private trackExecutionMetrics(): any {
        return { executions: this.executionQueue.size };
    }

    private optimizeExecution(): any {
        return { suggestion: 'MAINTAIN_STRATEGY' };
    }
}
