"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.limits = new Map([
            ['binance', 1200], // Binance allows 1200 requests per minute
            ['kraken', 60], // Kraken is more restrictive
            ['bybit', 600],
            ['poloniex', 180],
            ['gateio', 900]
        ]);
        this.window = 60000; // 1 minute in milliseconds
    }
    async throttle(exchange) {
        const limit = this.limits.get(exchange.toLowerCase()) || 60;
        const now = Date.now();
        const requests = this.requests.get(exchange) || [];
        // Remove old requests
        const recent = requests.filter(time => now - time < this.window);
        if (recent.length >= limit) {
            const oldestRequest = recent[0];
            const waitTime = this.window - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        recent.push(now);
        this.requests.set(exchange, recent);
    }
}
exports.RateLimiter = RateLimiter;
