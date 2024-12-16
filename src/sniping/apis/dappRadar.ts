import axios from 'axios';
import { TokenMetadata } from '../types/interfaces';

export class DappRadarAPI {
    private readonly baseUrl = 'https://apis.dappradar.com/v2';
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async getTokenData(address: string): Promise<TokenMetadata> {
        const response = await axios.get(
            `${this.baseUrl}/tokens/${address}`,
            {
                headers: {
                    'X-API-KEY': this.apiKey
                }
            }
        );

        return {
            address,
            name: response.data.name,
            symbol: response.data.symbol,
            creationTime: response.data.createdAt,
            liquidityAmount: response.data.liquidity?.usd || 0,
            marketCap: response.data.marketCap?.usd || 0,
            volume24h: response.data.volume24h?.usd || 0,
            holders: response.data.holders || 0
        };
    }

    async getTokenVolume(address: string): Promise<number> {
        const response = await axios.get(
            `${this.baseUrl}/tokens/${address}/volume`,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );

        return response.data.volume24h?.usd || 0;
    }

    async getNewTokens(): Promise<TokenMetadata[]> {
        const response = await axios.get(
            `${this.baseUrl}/tokens/new`,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                params: {
                    limit: 100,
                    sortBy: 'createdAt',
                    order: 'desc'
                }
            }
        );

        return response.data.tokens.map((token: any) => ({
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            creationTime: token.createdAt,
            liquidityAmount: token.liquidity?.usd || 0,
            marketCap: token.marketCap?.usd || 0,
            volume24h: token.volume24h?.usd || 0,
            holders: token.holders || 0
        }));
    }

    async testConnection(): Promise<boolean> {
        try {
            await axios.get(`${this.baseUrl}/dapps`, {
                headers: {
                    'X-API-KEY': this.apiKey
                }
            });
            console.log('DappRadar API connection successful!');
            return true;
        } catch (error) {
            console.error('DappRadar API connection failed:', error);
            return false;
        }
    }
}
