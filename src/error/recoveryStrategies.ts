
export class RecoveryStrategies {
    async executeRecoveryStrategy(
        errorType: string,
        transaction: any,
        attempt: number
    ) {
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
