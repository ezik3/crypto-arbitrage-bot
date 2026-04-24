"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
class CacheManager {
    async cachePrice(token, price) {
        this.priceCache.set(token, {
            price,
            timestamp: Date.now()
        });
    }
}
exports.CacheManager = CacheManager;
CacheManager.CACHE_DURATION = 30000; // 30 seconds
