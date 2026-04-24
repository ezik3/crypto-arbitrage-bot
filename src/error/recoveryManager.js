"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryManager = void 0;
class RecoveryManager {
    constructor() {
        this.retryAttempts = new Map();
        this.MAX_RETRIES = 3;
    }
    async handleError(error, transaction) {
        const errorType = this.classifyError(error);
        const recovery = await this.attemptRecovery(errorType, transaction);
        return this.executeRecoveryStrategy(recovery);
    }
}
exports.RecoveryManager = RecoveryManager;
