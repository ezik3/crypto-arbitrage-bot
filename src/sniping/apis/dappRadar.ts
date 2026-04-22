import axios, { AxiosError } from 'axios';
import { TokenMetadata } from '../types/interfaces';
import { apiConfig } from '../../config/apiConfig';

export class DappRadarAPI {
    private readonly baseUrl = apiConfig.dappradar.baseURL;
    private readonly headers: Record<string, string>;

    constructor(apiKey?: string) {
        this.headers = {
            ...apiConfig.dappradar.headers,
            'x-api-key': apiKey || process.env.DAPPRADAR_API_KEY || ''
        };
    }

    async getTokenData(address: string): Promise<TokenMetadata> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/tokens/${address}`,
                { headers: this.headers }
            );

            return {
                address,
                chain: 'ethereum',
                source: 'dappradar',
                name: response.data.name || 'Unknown',
                symbol: response.data.symbol || 'Unknown',
                creationTime: response.data.createdAt || Date.now(),
                liquidityAmount: response.data.liquidity?.usd || 0,
                marketCap: response.data.marketCap?.usd || 0,
                volume24h: response.data.volume24h?.usd || 0,
                holders: response.data.holders || 0,
                liquidity: response.data.liquidity?.usd || 0,
                securityScore: 70
            };
        } catch (error) {
            console.error('Error fetching token data:', error);
            throw error;
        }
    }

    async getTokenVolume(address: string): Promise<number> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/tokens/${address}/volume`,
                { headers: this.headers }
            );

            return response.data.volume24h?.usd || 0;
        } catch (error) {
            console.error('Error fetching token volume:', error);
            return 0;
        }
    }

    async getNewTokens(): Promise<TokenMetadata[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/tokens/new`, {
                timeout: 5000,
                headers: this.headers
            });
            return this.formatTokenData(response.data);
        } catch (error) {
            console.log('⚠️ Failed to fetch new tokens, using cache');
            return [];
        }
    }

    private formatTokenData(data: any): TokenMetadata[] {
        if (!Array.isArray(data)) return [];
        return data.map(token => ({
            address: token.address,
            chain: 'ethereum',
            source: 'dappradar',
            name: token.name || 'Unknown',
            symbol: token.symbol || 'Unknown',
            creationTime: token.createdAt || Date.now(),
            liquidityAmount: token.liquidity?.usd || 0,
            marketCap: token.marketCap?.usd || 0,
            volume24h: token.volume24h?.usd || 0,
            holders: token.holders || 0,
            liquidity: token.liquidity?.usd || 0,
            securityScore: 70
        }));
    }

    async testConnection(): Promise<boolean> {
        try {
            console.log('Testing with headers:', {
                ...this.headers,
                'x-api-key': 'REDACTED'
            });

            const response = await axios.get(`${this.baseUrl}/tokens/chains`, {
                timeout: 5000,
                headers: this.headers
            });
            
            if (response.data && response.data.success) {
                console.log('✅ DappRadar API connection successful');
                return true;
            }
            throw new Error('Invalid response format');
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.log('⚠️ DappRadar API connection failed:', error.message);
                if (error.response) {
                    console.log('Response data:', error.response.data);
                    console.log('Response status:', error.response.status);
                }
            } else {
                console.log('⚠️ DappRadar API connection failed:', 'Unknown error occurred');
            }
            return false;
        }
    }
}