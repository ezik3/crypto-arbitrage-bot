
export class TransactionBundler {
    async createProtectedBundle(
        transactions: any[],
        blockNumber: number
    ) {
        return {
            transactions,
            blockNumber,
            minTimestamp: Date.now(),
            maxTimestamp: Date.now() + 120000 // 2 minute validity
        };
    }
}
