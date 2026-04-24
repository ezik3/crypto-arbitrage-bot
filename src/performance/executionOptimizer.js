"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionOptimizer = void 0;
class ExecutionOptimizer {
    async optimizeTransactionBatch(transactions) {
        const optimizedBatch = await Promise.all(transactions.map(tx => this.optimizeTransaction(tx)));
        return this.prioritizeAndSchedule(optimizedBatch);
    }
}
exports.ExecutionOptimizer = ExecutionOptimizer;
