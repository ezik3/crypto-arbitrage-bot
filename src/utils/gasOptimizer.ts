
import { ethers } from 'ethers';

export class GasOptimizer {
    async calculateOptimalGas(provider: ethers.providers.Provider) {
        const gasPrice = await provider.getGasPrice();
        const blockNumber = await provider.getBlockNumber();
        const lastBlock = await provider.getBlock(blockNumber);
        
        return this.optimizeGasPrice(gasPrice, lastBlock.baseFeePerGas);
    }

    optimizeGasPrice(gasPrice: any, baseFee: any): any { return { maxFeePerGas: gasPrice, maxPriorityFeePerGas: gasPrice }; }
}
