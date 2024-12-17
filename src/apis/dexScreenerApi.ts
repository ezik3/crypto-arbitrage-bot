import axios from 'axios';
import { Settings } from '../config/settings';

interface DexScreenerPair {
    chainId: string;
    dexId: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceUsd: string;
    liquidity: {
        usd: number;
    };
    pairCreatedAt: number;
}

export class DexScreenerAPI {
    private readonly baseUrl = 'https://api.dexscreener.com/latest/dex';
    private lastRequestTime: number = 0;
    private readonly minRequestInterval = 1000; // 1 second between requests (60 requests/minute limit)

    async getPairsByToken(tokenAddress: string): Promise<DexScreenerPair[]> {
        await this.throttleRequest();
        try {
            const response = await axios.get(`${this.baseUrl}/tokens/${tokenAddress}`);
            return response.data.pairs || [];
        } catch (error) {
            console.error('Error fetching pairs from DexScreener:', error);
            return [];
        }
    }

    async getLatestPairs(): Promise<DexScreenerPair[]> {
        await this.throttleRequest();
        try {
            const response = await axios.get(`${this.baseUrl}/pairs/latest`);
            return response.data.pairs || [];
        } catch (error) {
            console.error('Error fetching latest pairs:', error);
            return [];
        }
    }

    async searchPairs(query: string): Promise<DexScreenerPair[]> {
        await this.throttleRequest();
        try {
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: { q: query }
            });
            return response.data.pairs || [];
        } catch (error) {
            console.error('Error searching pairs:', error);
            return [];
        }
    }

    private async throttleRequest(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
        }
        
        this.lastRequestTime = Date.now();
    }
}
