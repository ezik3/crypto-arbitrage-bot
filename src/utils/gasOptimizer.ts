
import { ethers } from 'ethers';

export interface GasEstimate {
    gasPrice: ethers.BigNumber;
    maxFeePerGas: ethers.BigNumber;
    maxPriorityFeePerGas: ethers.BigNumber;
    estimatedCostEth: number;
    estimatedCostUsd: number;
}

export class GasOptimizer {
    /**
     * Calculate the optimal gas parameters from the current network state.
     * @param provider - connected ethers provider
     * @param ethPriceUsd - current ETH price in USD for cost estimation
     * @param gasLimit - estimated gas units for the transaction (default 300_000)
     */
    async calculateOptimalGas(
        provider: ethers.providers.Provider,
        ethPriceUsd: number = 2000,
        gasLimit: number = 300_000
    ): Promise<GasEstimate> {
        const feeData = await provider.getFeeData();

        // EIP-1559 support
        const maxFeePerGas = feeData.maxFeePerGas ?? feeData.gasPrice ?? ethers.utils.parseUnits('30', 'gwei');
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? ethers.utils.parseUnits('2', 'gwei');
        const gasPrice = feeData.gasPrice ?? maxFeePerGas;

        const totalGasWei = gasPrice.mul(gasLimit);
        const estimatedCostEth = parseFloat(ethers.utils.formatEther(totalGasWei));
        const estimatedCostUsd = estimatedCostEth * ethPriceUsd;

        return {
            gasPrice,
            maxFeePerGas,
            maxPriorityFeePerGas,
            estimatedCostEth,
            estimatedCostUsd
        };
    }

    private optimizeGasPrice(
        gasPrice: ethers.BigNumber,
        baseFee: ethers.BigNumber | null
    ): ethers.BigNumber {
        if (!baseFee) return gasPrice;
        // Add a 10% tip above base fee for faster inclusion
        return baseFee.mul(110).div(100);
    }
}
