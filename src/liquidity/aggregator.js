"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityAggregator = void 0;
class LiquidityAggregator {
    async aggregateLiquidity(tokenAddress, amount, dexes) {
        const liquidityMap = await this.fetchDexLiquidity(tokenAddress, dexes);
        return this.optimizeLiquiditySplit(liquidityMap, amount);
    }
}
exports.LiquidityAggregator = LiquidityAggregator;
