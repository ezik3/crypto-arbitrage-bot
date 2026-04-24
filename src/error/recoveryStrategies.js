"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryStrategies = void 0;
class RecoveryStrategies {
    async executeRecoveryStrategy(errorType, transaction, attempt) {
        switch (errorType) {
            case 'FUNDING_ERROR':
                return this.handleFundingError(transaction);
            case 'GAS_ERROR':
                return this.optimizeGasAndRetry(transaction);
            default:
                return this.defaultRecovery(transaction, attempt);
        }
    }
}
exports.RecoveryStrategies = RecoveryStrategies;
