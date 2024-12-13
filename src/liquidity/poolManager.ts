
export class PoolManager {
    async findBestPools(
        tokenA: string,
        tokenB: string,
        amount: string
    ) {
        const pools = await this.fetchAllPools(tokenA, tokenB);
        return this.rankPoolsByLiquidity(pools, amount);
    }
}
