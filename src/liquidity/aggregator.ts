
import { ethers } from 'ethers';
import { ExchangeManager } from '../exchanges';

export class LiquidityAggregator {
    private exchanges: ExchangeManager;
    
    async aggregateLiquidity(
        tokenAddress: string,
        amount: string,
        dexes: string[]
    ) {
        const liquidityMap = await this.fetchDexLiquidity(tokenAddress, dexes);
        return this.optimizeLiquiditySplit(liquidityMap, amount);
    }
}
