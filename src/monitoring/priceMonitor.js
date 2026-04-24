"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceMonitor = void 0;
class PriceMonitor {
    constructor() {
        this.priceThresholds = new Map();
    }
    async monitorPrices(tokens, interval = 1000) {
        while (true) {
            for (const token of tokens) {
                const prices = await this.fetchPricesAcrossExchanges(token);
                this.analyzePriceMovement(token, prices);
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
}
exports.PriceMonitor = PriceMonitor;
