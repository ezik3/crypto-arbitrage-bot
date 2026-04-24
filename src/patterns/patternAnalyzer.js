"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternAnalyzer = void 0;
class PatternAnalyzer {
    async analyzeMarketPatterns() {
        const priceData = await this.getPriceHistory();
        const patterns = this.identifyPatterns(priceData);
        return {
            identifiedPatterns: patterns,
            reliability: this.calculatePatternReliability(patterns),
            tradingSignals: this.generateSignals(patterns)
        };
    }
}
exports.PatternAnalyzer = PatternAnalyzer;
