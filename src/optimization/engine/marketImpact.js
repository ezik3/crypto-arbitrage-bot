"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketImpactAnalyzer = void 0;
class MarketImpactAnalyzer {
    async analyzeMarketImpact(trade) {
        const impact = await this.calculatePriceImpact(trade);
        const liquidity = await this.assessLiquidityDepth(trade);
        return {
            expectedImpact: impact,
            recommendedSize: this.calculateOptimalSize(impact, liquidity),
            riskLevel: this.assessRiskLevel(impact)
        };
    }
}
exports.MarketImpactAnalyzer = MarketImpactAnalyzer;
