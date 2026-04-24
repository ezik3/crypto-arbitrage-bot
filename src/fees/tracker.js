"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeTracker = void 0;
class FeeTracker {
    constructor() {
        this.historicalFees = new Map();
    }
    async trackAndPredict(dex, currentFee) {
        this.updateFeeHistory(dex, currentFee);
        return this.predictNextFee(dex);
    }
}
exports.FeeTracker = FeeTracker;
