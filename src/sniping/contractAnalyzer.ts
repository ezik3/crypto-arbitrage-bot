import { ethers } from 'ethers';
import { SecurityReport } from './types/interfaces';
import axios from 'axios';

export class ContractAnalyzer {
    private provider: ethers.Provider;
    private quillaiApi: string;

    constructor(rpcUrl: string, quillaiApiKey: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.quillaiApi = quillaiApiKey;
    }

    async analyzeContract(address: string): Promise<SecurityReport> {
        const [honeypotCheck, rugPullRisk, liquidityLock] = await Promise.all([
            this.checkHoneypot(address),
            this.checkRugPullRisk(address),
            this.checkLiquidityLock(address)
        ]);

        return {
            isHoneypot: honeypotCheck,
            rugPullRisk: rugPullRisk,
            liquidityLocked: liquidityLock,
            contractVerified: await this.isContractVerified(address),
            ownershipRenounced: await this.isOwnershipRenounced(address),
            score: this.calculateSecurityScore({
                honeypot: honeypotCheck,
                rugPull: rugPullRisk,
                liquidity: liquidityLock
            })
        };
    }

    private async checkHoneypot(address: string): Promise<boolean> {
        const response = await axios.get(`https://api.quillai.network/check/${address}`, {
            headers: { 'Authorization': `Bearer ${this.quillaiApi}` }
        });
        return response.data.isHoneypot;
    }

    private async checkRugPullRisk(address: string): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
        try {
            const contract = new ethers.Contract(
                address,
                ['function owner() view returns (address)'],
                this.provider
            );
            const owner = await contract.owner();
            
            // Check if ownership is renounced
            if (owner === '0x0000000000000000000000000000000000000000') {
                return 'LOW';
            }
            
            // Additional rug pull checks can be added here
            return 'MEDIUM';
        } catch {
            return 'HIGH';
        }
    }

    private async checkLiquidityLock(address: string): Promise<boolean> {
        try {
            const response = await axios.get(`https://api.quillai.network/liquidity/${address}`, {
                headers: { 'Authorization': `Bearer ${this.quillaiApi}` }
            });
            return response.data.liquidityLocked;
        } catch {
            return false;
        }
    }

    private async isContractVerified(address: string): Promise<boolean> {
        try {
            const code = await this.provider.getCode(address);
            return code !== '0x';
        } catch {
            return false;
        }
    }

    private async isOwnershipRenounced(address: string): Promise<boolean> {
        try {
            const contract = new ethers.Contract(
                address,
                ['function owner() view returns (address)'],
                this.provider
            );
            const owner = await contract.owner();
            return owner === '0x0000000000000000000000000000000000000000';
        } catch {
            return false;
        }
    }

    private calculateSecurityScore(checks: {
        honeypot: boolean;
        rugPull: 'LOW' | 'MEDIUM' | 'HIGH';
        liquidity: boolean;
    }): number {
        let score = 100;

        if (checks.honeypot) score -= 50;
        if (checks.rugPull === 'HIGH') score -= 30;
        if (checks.rugPull === 'MEDIUM') score -= 15;
        if (!checks.liquidity) score -= 20;

        return Math.max(0, score);
    }
}
