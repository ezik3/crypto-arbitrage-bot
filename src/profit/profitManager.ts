import { ethers } from 'ethers';
import { FeeCalculator } from '../fees/calculator';

export interface ProfitabilityParams {
    type: 'cross' | 'triangular' | 'flash' | string;
    pair: string;
    profit: number;          // gross profit %
    volume: number;          // trade size in USD
    buyExchange?: string;
    sellExchange?: string;
    assetPriceUsd?: number;
    gasUsd?: number;
    flashLoanFeeRate?: number;
}

export interface ProfitabilityResult {
    isProfitable: boolean;
    grossProfitUsd: number;
    totalFeesUsd: number;
    netProfitUsd: number;
    netProfitPercent: number;
    breakdown: {
        grossUsd: number;
        buyFeeUsd: number;
        sellFeeUsd: number;
        withdrawalFeeUsd: number;
        gasUsd: number;
        flashLoanFeeUsd: number;
    };
}

export class ProfitManager {
    private profitMetrics: Map<string, any> = new Map();
    private feeCalculator: FeeCalculator = new FeeCalculator();

    private readonly MIN_NET_PROFIT_USD = 0.20;  // $0.20 minimum net profit

    async analyzeProfitability(params: ProfitabilityParams): Promise<ProfitabilityResult> {
        try {
            const grossProfitUsd = (params.profit / 100) * params.volume;

            const asset = params.pair?.split('/')?.[0] ?? 'USDT';
            const fees = this.feeCalculator.calculateTotalFees({
                tradeAmountUsd: params.volume,
                buyExchange: params.buyExchange ?? 'binance',
                sellExchange: params.sellExchange ?? 'binance',
                asset,
                assetPriceUsd: params.assetPriceUsd ?? 1,
                gasUsd: params.gasUsd ?? 0,
                flashLoanFeeRate: params.flashLoanFeeRate ?? 0
            });

            const netProfitUsd = grossProfitUsd - fees.total;
            const netProfitPercent = params.volume > 0 ? (netProfitUsd / params.volume) * 100 : 0;
            const isProfitable = netProfitUsd >= this.MIN_NET_PROFIT_USD;

            const result: ProfitabilityResult = {
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
        } catch (error) {
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
    rankOpportunities<T extends { profit: number; pair?: string }>(
        opportunities: T[],
        limit: number = 5
    ): T[] {
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

    private analyzeProfitOpportunities() {
        const metrics = Array.from(this.profitMetrics.values());
        const avgProfit = metrics.length
            ? metrics.reduce((s, m) => s + (m.netProfitPercent ?? 0), 0) / metrics.length
            : 0;
        return { potentialProfit: avgProfit, risk: 'LOW', confidence: 0.85 };
    }

    private rankStrategies() {
        return {
            bestStrategy: 'CROSS_EXCHANGE',
            expectedReturn: 1.2,
            reliability: 0.9
        };
    }

    private planProfitExecution() {
        return {
            steps: ['SCAN', 'VALIDATE', 'EXECUTE'],
            timing: 'IMMEDIATE',
            priority: 'HIGH'
        };
    }

    private setupProfitMonitoring() {
        return {
            alerts: true,
            thresholds: { min: 0.5, target: 1.0 },
            reporting: 'REAL_TIME'
        };
    }
}