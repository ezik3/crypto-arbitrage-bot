
import { ethers } from 'ethers';

export class SlippageProtector {
    calculateSlippageBuffer(amount: string, slippageTolerance: number = 0.5) {
        const baseAmount = ethers.utils.parseUnits(amount, 18);
        const buffer = baseAmount.mul(slippageTolerance).div(100);
        return {
            minOutput: baseAmount.sub(buffer),
            maxInput: baseAmount.add(buffer)
        };
    }
}
