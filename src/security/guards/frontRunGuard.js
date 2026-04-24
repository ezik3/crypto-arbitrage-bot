"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontRunGuard = void 0;
class FrontRunGuard {
    async preventFrontRunning(transaction) {
        const bundle = await this.createPrivateTransaction(transaction);
        const commitment = this.generateCommitment(bundle);
        return {
            bundle,
            commitment,
            validation: await this.validateExecution(bundle)
        };
    }
}
exports.FrontRunGuard = FrontRunGuard;
