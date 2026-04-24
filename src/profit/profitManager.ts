import { ethers } from 'ethers';

// Exchange trading fees (maker/taker %)
const EXCHANGE_FEES: Record<string, number> = {
    binance:  0.001,  // 0.10%
    bybit:    0.001,  // 0.10%
    kraken:   0.002,  // 0.20%
    poloniex: 0.002,  // 0.20%
    gateio:   0.002,  // 0.20%
    kucoin:   0.001,  // 0.10%
};

// Estimated execution latency in ms per exchange
const EXCHANGE_LATENCY_MS: Record<string, number> = {
    binance:  80,
    bybit:    100,
    kraken:   150,
    poloniex: 200,
    gateio:   200,
    kucoin:   120,
};

export interface ProfitabilityResult {
    isProfitable: boolean;
    grossProfit: number;       // % before fees
    netProfit: number;         // % after all fees
    estimatedUSDProfit: number;
    fees: {
        buyFee: number;
        sellFee: number;
        transferFee: number;
    };
    latencyRiskMs: number;
    riskScore: number;         // 0 = no risk, 1 = high risk
    recommendation: string;
}

export class ProfitManager {
    private profitMetrics: Map<string, any> = new Map();

    /**
     * Full profitability analysis factoring in exchange fees, latency risk, and
     * market risk. Returns whether the trade is profitable after all costs.
     */
    async analyzeProfitability(params: {
        type: string;
        pair: string;
        profit: number;        // gross profit %
        volume: number;        // trade volume in USD
        buyExchange?: string;
        sellExchange?: string;
        capitalUSD?: number;   // starting capital in USD (default $25)
    }): Promise<ProfitabilityResult> {
        try {
            const capitalUSD = params.capitalUSD ?? 25;
            const buyExchange = params.buyExchange ?? 'binance';
            const sellExchange = params.sellExchange ?? 'binance';

            // --- Fee calculation ---
            const buyFee  = EXCHANGE_FEES[buyExchange]  ?? 0.002;
            const sellFee = EXCHANGE_FEES[sellExchange] ?? 0.002;
            // Assume withdrawal/transfer fee ~0.05% of trade value
            const transferFee = 0.0005;
            const totalFeePct = (buyFee + sellFee + transferFee) * 100;

            const netProfitPct = params.profit - totalFeePct;

            // --- Latency risk ---
            const buyLatency  = EXCHANGE_LATENCY_MS[buyExchange]  ?? 200;
            const sellLatency = EXCHANGE_LATENCY_MS[sellExchange] ?? 200;
            const totalLatency = buyLatency + sellLatency;
            // Latency risk: price can move against us. High latency → higher risk.
            // Rough model: each 100 ms of latency adds 0.02% price-move risk
            const latencyRiskPct = (totalLatency / 100) * 0.02;
            const adjustedNetProfit = netProfitPct - latencyRiskPct;

            // --- Risk score (0–1) ---
            // Consider volume relative to capital (high leverage = higher risk)
            const leverage = params.volume / capitalUSD;
            const riskScore = Math.min(1, (leverage / 10) * 0.5 + (totalLatency / 1000) * 0.3 + (1 - Math.min(1, adjustedNetProfit / 2)) * 0.2);

            const estimatedUSDProfit = (adjustedNetProfit / 100) * capitalUSD;

            // Minimum thresholds:
            // - net profit must be > 0.3% after fees (covers slippage cushion)
            // - estimated USD profit > $0.01 (meaningful for small capital)
            // - risk score < 0.7
            const minNetProfitPct = 0.3;
            const isProfitable = adjustedNetProfit > minNetProfitPct &&
                                  estimatedUSDProfit > 0.01 &&
                                  riskScore < 0.7;

            let recommendation = '';
            if (isProfitable) {
                recommendation = `EXECUTE: ~${adjustedNetProfit.toFixed(3)}% net profit (~$${estimatedUSDProfit.toFixed(4)} on $${capitalUSD})`;
            } else if (adjustedNetProfit <= 0) {
                recommendation = `SKIP: Trade unprofitable after fees (net ${adjustedNetProfit.toFixed(3)}%)`;
            } else if (riskScore >= 0.7) {
                recommendation = `SKIP: Risk score ${riskScore.toFixed(2)} too high`;
            } else {
                recommendation = `SKIP: Net profit ${adjustedNetProfit.toFixed(3)}% below minimum threshold`;
            }

            const result: ProfitabilityResult = {
                isProfitable,
                grossProfit: params.profit,
                netProfit: adjustedNetProfit,
                estimatedUSDProfit,
                fees: { buyFee: buyFee * 100, sellFee: sellFee * 100, transferFee: transferFee * 100 },
                latencyRiskMs: totalLatency,
                riskScore,
                recommendation,
            };

            // Cache result
            const key = `${params.pair}:${buyExchange}:${sellExchange}`;
            this.profitMetrics.set(key, { ...result, timestamp: Date.now() });

            return result;
        } catch (error) {
            console.error('Error analyzing profitability:', error);
            return {
                isProfitable: false,
                grossProfit: params.profit,
                netProfit: -999,
                estimatedUSDProfit: 0,
                fees: { buyFee: 0, sellFee: 0, transferFee: 0 },
                latencyRiskMs: 0,
                riskScore: 1,
                recommendation: 'ERROR: profitability analysis failed',
            };
        }
    }

    async optimizeProfits() {
        const analysis = await this.analyzeProfitOpportunities();
        return {
            strategies: this.rankStrategies(),
            execution: this.planProfitExecution(),
            monitoring: this.setupProfitMonitoring()
        };
    }

    /** Returns the last cached profitability result for a pair, if any. */
    getCachedResult(pair: string, buyExchange: string, sellExchange: string): any | undefined {
        return this.profitMetrics.get(`${pair}:${buyExchange}:${sellExchange}`);
    }

    private async analyzeProfitOpportunities() {
        return {
            potentialProfit: 1.5,
            risk: 'LOW',
            confidence: 0.95
        };
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
            steps: ['BUY_BINANCE', 'SELL_KUCOIN'],
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
