
export class CacheManager {
    private static readonly CACHE_DURATION = 30000; // 30 seconds
    private priceCache: Map<string, { price: number; timestamp: number }>;

    async cachePrice(token: string, price: number) {
        this.priceCache.set(token, {
            price,
            timestamp: Date.now()
        });
    }
}
