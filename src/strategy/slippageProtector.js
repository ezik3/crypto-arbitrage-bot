"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageProtector = void 0;
class SlippageProtector {
    calculateSlippageBuffer(amount, slippageTolerance = 0.5) {
        const baseAmount = ethers.utils.parseUnits(amount, 18);
        const buffer = baseAmount.mul(slippageTolerance).div(100);
        return {
            minOutput: baseAmount.sub(buffer),
            maxInput: baseAmount.add(buffer)
        };
    }
}
exports.SlippageProtector = SlippageProtector;
