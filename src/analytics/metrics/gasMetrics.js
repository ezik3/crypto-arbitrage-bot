"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasMetrics = void 0;
class GasMetrics {
    async analyzeGasUsage(transactions) {
        const gasUsage = await this.calculateGasMetrics(transactions);
        return {
            averageGasUsed: this.calculateAverageGas(gasUsage),
            gasEfficiency: this.calculateEfficiency(gasUsage),
            optimizationSuggestions: this.generateOptimizations(gasUsage)
        };
    }
}
exports.GasMetrics = GasMetrics;
