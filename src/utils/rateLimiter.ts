export class RateLimiter {
    private limits: Map<string, { count: number; resetTime: number }> = new Map();
    private defaultLimit = 10; // requests per second
    private defaultWindow = 1000; // 1 second in milliseconds

    async throttle(exchangeName: string): Promise<void> {
        const key = exchangeName;
        const now = Date.now();
        
        if (!this.limits.has(key)) {
            this.limits.set(key, { count: 1, resetTime: now + this.defaultWindow });
            return;
        }

        const limit = this.limits.get(key)!;
        
        if (now > limit.resetTime) {
            // Reset window
            limit.count = 1;
            limit.resetTime = now + this.defaultWindow;
            return;
        }

        if (limit.count >= this.defaultLimit) {
            // Wait until window resets
            const waitTime = limit.resetTime - now;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Reset after waiting
            limit.count = 1;
            limit.resetTime = Date.now() + this.defaultWindow;
        } else {
            limit.count++;
        }
    }

    setLimit(exchangeName: string, limit: number, windowMs: number = 1000): void {
        // For future customization
        console.log(`Setting limit for ${exchangeName}: ${limit} requests per ${windowMs}ms`);
    }

    getStatus(exchangeName: string): { used: number; remaining: number; resetIn: number } {
        const key = exchangeName;
        const now = Date.now();
        
        if (!this.limits.has(key)) {
            return { used: 0, remaining: this.defaultLimit, resetIn: this.defaultWindow };
        }

        const limit = this.limits.get(key)!;
        
        if (now > limit.resetTime) {
            return { used: 0, remaining: this.defaultLimit, resetIn: this.defaultWindow };
        }

        const remaining = Math.max(0, this.defaultLimit - limit.count);
        const resetIn = limit.resetTime - now;

        return { used: limit.count, remaining, resetIn };
    }

    clear(): void {
        this.limits.clear();
    }
}