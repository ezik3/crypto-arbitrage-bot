
export class FeeTracker {
    private historicalFees: Map<string, number[]> = new Map();

    async trackAndPredict(
        dex: string,
        currentFee: number
    ) {
        this.updateFeeHistory(dex, currentFee);
        return this.predictNextFee(dex);
    }
}
