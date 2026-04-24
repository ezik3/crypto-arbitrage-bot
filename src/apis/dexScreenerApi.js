"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexScreenerAPI = void 0;
const axios_1 = __importDefault(require("axios"));
class DexScreenerAPI {
    constructor() {
        this.baseUrl = 'https://api.dexscreener.com/latest/dex';
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second between requests (60 requests/minute limit)
    }
    async getPairsByToken(tokenAddress) {
        await this.throttleRequest();
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tokens/${tokenAddress}`);
            return response.data.pairs || [];
        }
        catch (error) {
            console.error('Error fetching pairs from DexScreener:', error);
            return [];
        }
    }
    async getLatestPairs() {
        await this.throttleRequest();
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/pairs/latest`);
            return response.data.pairs || [];
        }
        catch (error) {
            console.error('Error fetching latest pairs:', error);
            return [];
        }
    }
    async searchPairs(query) {
        await this.throttleRequest();
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/search`, {
                params: { q: query }
            });
            return response.data.pairs || [];
        }
        catch (error) {
            console.error('Error searching pairs:', error);
            return [];
        }
    }
    async throttleRequest() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }
}
exports.DexScreenerAPI = DexScreenerAPI;
