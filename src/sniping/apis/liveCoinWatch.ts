import axios from 'axios';
import { TokenMetadata } from '../types/interfaces';

export class LiveCoinWatchAPI {
    private readonly baseUrl = 'https://api.livecoinwatch.com';
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async testApiConnection(): Promise<boolean> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/coins/single`,
                {
                    currency: "USD",
                    code: "BTC",
                    meta: true
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'x-api-key': this.apiKey
                    },
                    timeout: 5000
                }
            );
            console.log('✅ LiveCoinWatch API connection successful');
            return true;
        } catch (error: any) {
            console.error('❌ LiveCoinWatch API connection failed:', error.message);
            return false;
        }
    }

    async getTokenMetadata(address: string): Promise<TokenMetadata> {
        const response = await axios.post(
            `${this.baseUrl}/coins/single`,
            {
                currency: 'USD',
                code: address,
                meta: true
            },
            {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            address: response.data.address,
            chain: 'ethereum',
            symbol: response.data.symbol,
            name: response.data.name,
            creationTime: response.data.createdAt || Date.now(),
            liquidityAmount: response.data.liquidity || 0,
            marketCap: response.data.marketCap || 0,
            volume24h: response.data.volume24h || 0,
            holders: response.data.holders || 0,
            liquidity: response.data.liquidity || 0,
            securityScore: 70,
            source: 'livecoinwatch',
            rate: response.data.rate || 0
        };
    }

    async getNewTokens(): Promise<TokenMetadata[]> {
        const response = await axios.post(
            `${this.baseUrl}/coins/list`,
            {
                currency: 'USD',
                sort: 'createdAt',
                order: 'descending',
                offset: 0,
                limit: 100,
                meta: true
            },
            {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.map((token: any) => ({
            address: token.address,
            chain: 'ethereum',
            symbol: token.symbol,
            name: token.name,
            creationTime: token.createdAt || Date.now(),
            liquidityAmount: token.liquidity || 0,
            marketCap: token.marketCap || 0,
            volume24h: token.volume24h || 0,
            holders: token.holders || 0,
            liquidity: token.liquidity || 0,
            securityScore: 70,
            source: 'livecoinwatch',
            rate: token.rate || 0
        }));
    }

    async getTokenPrice(address: string): Promise<number> {
        const response = await axios.post(
            `${this.baseUrl}/coins/single`,
            {
                currency: 'USD',
                code: address,
            },
            {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.rate || 0;
    }
} 