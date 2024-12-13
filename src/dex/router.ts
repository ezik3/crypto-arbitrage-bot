
import { ethers } from 'ethers';
import { ExchangeManager } from '../exchanges';

export class DexRouter {
    private exchanges: ExchangeManager;
    
    constructor() {
        this.exchanges = new ExchangeManager();
    }

    async findBestRoute(
        tokenIn: string,
        tokenOut: string,
        amount: string,
        maxHops: number = 3
    ) {
        const routes = await this.calculateAllRoutes(tokenIn, tokenOut, maxHops);
        return this.optimizeRoutes(routes, amount);
    }
}