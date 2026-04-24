"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionBundler = void 0;
class TransactionBundler {
    async createProtectedBundle(transactions, blockNumber) {
        return {
            transactions,
            blockNumber,
            minTimestamp: Date.now(),
            maxTimestamp: Date.now() + 120000 // 2 minute validity
        };
    }
}
exports.TransactionBundler = TransactionBundler;
