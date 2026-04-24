"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskManager = void 0;
class RiskManager {
    constructor() {
        this.riskLevels = new Map();
        // Max fraction of total capital allowed per single trade
        this.MAX_POSITION_FRACTION = 0.25; // 25%
        this.MAX_RISK_EXPOSURE = 0.10; // 10% drawdown tolerance
        this.MIN_PROFIT_AFTER_FEES = 0.15; // 0.15%
        this.MAX_SLIPPAGE = 0.005; // 0.5%
        // Per-exchange risk multipliers (lower = riskier due to lower liquidity)
        this.EXCHANGE_RISK = {
            binance: 0.8,
            bybit: 0.85,
            kraken: 0.9,
            kucoin: 0.85,
            poloniex: 1.0,
            gateio: 0.95
        };
    }
    async evaluateRisk(trade) {
        var _a, _b, _c;
        const reasons = [];
        const recommendations = [];
        const marketRisk = await this.assessMarketRisk(trade.pair);
        const positionRisk = this.calculatePositionRisk(trade);
        const exchangeRisk = (_a = this.EXCHANGE_RISK[trade.exchange.toLowerCase()]) !== null && _a !== void 0 ? _a : 1.0;
        const totalRisk = this.calculateTotalRisk(marketRisk, positionRisk, exchangeRisk);
        const maxAllowedPosition = this.calculateMaxPosition(trade.totalCapital);
        // Check if profit is meaningful after estimated fees
        if (trade.profitPercent < this.MIN_PROFIT_AFTER_FEES) {
            reasons.push(`Profit ${trade.profitPercent.toFixed(3)}% below minimum threshold ${this.MIN_PROFIT_AFTER_FEES}%`);
        }
        // Check position size
        if (trade.tradeSize > maxAllowedPosition) {
            reasons.push(`Trade size $${trade.tradeSize} exceeds max allowed position $${maxAllowedPosition.toFixed(2)}`);
            recommendations.push(`Reduce trade size to $${maxAllowedPosition.toFixed(2)}`);
        }
        // Check slippage
        if (((_b = trade.slippage) !== null && _b !== void 0 ? _b : 0) > this.MAX_SLIPPAGE) {
            reasons.push(`Slippage ${(((_c = trade.slippage) !== null && _c !== void 0 ? _c : 0) * 100).toFixed(2)}% exceeds max ${this.MAX_SLIPPAGE * 100}%`);
            recommendations.push('Wait for better market conditions or reduce trade size');
        }
        // Check total risk exposure
        if (totalRisk > this.MAX_RISK_EXPOSURE) {
            reasons.push(`Total risk ${(totalRisk * 100).toFixed(1)}% exceeds maximum ${this.MAX_RISK_EXPOSURE * 100}%`);
            recommendations.push('Reduce position size or skip this trade');
        }
        const approved = reasons.length === 0;
        if (approved) {
            recommendations.push('Trade meets all risk criteria — proceed');
        }
        // Track historical risk
        this.riskLevels.set(trade.pair, totalRisk);
        return { approved, totalRisk, recommendations, maxAllowedPosition, reasons };
    }
    async assessMarketRisk(pair) {
        var _a;
        // Heuristic: use stored recent risk level or default moderate risk
        const recent = (_a = this.riskLevels.get(pair)) !== null && _a !== void 0 ? _a : 0.05;
        return Math.min(recent, 0.5);
    }
    calculatePositionRisk(trade) {
        if (trade.totalCapital <= 0)
            return 1;
        const fraction = trade.tradeSize / trade.totalCapital;
        return Math.min(fraction, 1);
    }
    calculateTotalRisk(marketRisk, positionRisk, exchangeRisk) {
        // Weighted combination
        return marketRisk * 0.3 + positionRisk * 0.5 + (exchangeRisk - 0.8) * 0.2;
    }
    generateRiskMitigations(risk) {
        const mitigations = [];
        if (risk > 0.15)
            mitigations.push('Consider splitting trade into smaller chunks');
        if (risk > 0.25)
            mitigations.push('Increase minimum profit threshold');
        if (risk > 0.40)
            mitigations.push('Skip trade – risk too high');
        return mitigations;
    }
    calculateMaxPosition(totalCapital) {
        return totalCapital * this.MAX_POSITION_FRACTION;
    }
    /**
     * Returns the recommended trade size for a given capital amount.
     * Starts conservatively for small capital ($10–$50).
     */
    getRecommendedTradeSize(capital) {
        if (capital < 20)
            return capital * 0.5; // 50% for very small capital
        if (capital < 100)
            return capital * 0.3; // 30%
        if (capital < 1000)
            return capital * 0.25; // 25%
        return capital * 0.2; // 20% for larger capital
    }
}
exports.RiskManager = RiskManager;
