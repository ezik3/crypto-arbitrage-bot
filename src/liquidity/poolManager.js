"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolManager = void 0;
class PoolManager {
    async findBestPools(tokenA, tokenB, amount) {
        const pools = await this.fetchAllPools(tokenA, tokenB);
        return this.rankPoolsByLiquidity(pools, amount);
    }
}
exports.PoolManager = PoolManager;
