import axios from 'axios';
import { SecurityReport } from '../types/interfaces';

export class QuillAIAPI {
    private readonly baseUrl = 'https://api.quillai.network';
    private readonly _apiKey: string;

    constructor(apiKey: string) {
        this._apiKey = apiKey;
    }

    get apiKey(): string {
        return this._apiKey;
    }

    async analyzeContract(address: string): Promise<SecurityReport> {
        const response = await axios.get(
            `${this.baseUrl}/check/${address}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );

        const data = response.data;
        return {
            isHoneypot: data.isHoneypot || false,
            rugPullRisk: this.calculateRugPullRisk(data),
            liquidityLocked: data.liquidityLocked || false,
            contractVerified: data.contractVerified || false,
            ownershipRenounced: data.ownershipRenounced || false,
            score: data.securityScore || 0
        };
    }

    async getTokenMetrics(address: string): Promise<{
        buyTax: number;
        sellTax: number;
        liquidityLock: boolean;
        riskLevel: string;
    }> {
        const response = await axios.get(
            `${this.baseUrl}/metrics/${address}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );

        return {
            buyTax: response.data.buyTax || 0,
            sellTax: response.data.sellTax || 0,
            liquidityLock: response.data.liquidityLocked || false,
            riskLevel: response.data.riskLevel || 'HIGH'
        };
    }

    private calculateRugPullRisk(data: any): 'LOW' | 'MEDIUM' | 'HIGH' {
        const score = data.securityScore || 0;
        if (score >= 80) return 'LOW';
        if (score >= 50) return 'MEDIUM';
        return 'HIGH';
    }

    async monitorContract(address: string): Promise<void> {
        await axios.post(
            `${this.baseUrl}/monitor`,
            { address },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );
    }

    async getAlerts(address: string): Promise<any[]> {
        const response = await axios.get(
            `${this.baseUrl}/alerts/${address}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        );

        return response.data.alerts || [];
    }
}
