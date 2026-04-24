
import { ethers } from 'ethers';

export interface SecurityCheckResult {
    passed: boolean;
    issues: string[];
}

export class SecurityProtector {
    private readonly MAX_SLIPPAGE = 0.02;      // 2%
    private readonly MAX_GAS_MULTIPLIER = 1.5;
    private readonly MIN_PROFIT_USD = 0.5;

    /**
     * Run all security checks before executing a transaction.
     */
    async protectTransaction(tx: {
        profitPercent: number;
        profitUsd: number;
        slippage: number;
        gasPrice: ethers.BigNumber;
        baseGasPrice: ethers.BigNumber;
        to?: string;
    }): Promise<SecurityCheckResult> {
        const issues: string[] = [];

        const checks = await this.runSecurityChecks(tx);
        for (const [check, passed] of Object.entries(checks)) {
            if (!passed) issues.push(check);
        }

        if (issues.length > 0) {
            return { passed: false, issues };
        }
        return { passed: true, issues: [] };
    }

    private async runSecurityChecks(tx: {
        profitPercent: number;
        profitUsd: number;
        slippage: number;
        gasPrice: ethers.BigNumber;
        baseGasPrice: ethers.BigNumber;
        to?: string;
    }): Promise<Record<string, boolean>> {
        return {
            'profit_above_minimum': tx.profitUsd >= this.MIN_PROFIT_USD,
            'slippage_within_limit': tx.slippage <= this.MAX_SLIPPAGE,
            'gas_price_reasonable': tx.gasPrice.lte(tx.baseGasPrice.mul(Math.round(this.MAX_GAS_MULTIPLIER * 100)).div(100)),
            'positive_profit': tx.profitPercent > 0,
            'recipient_not_zero': !tx.to || tx.to !== ethers.constants.AddressZero
        };
    }

    /**
     * Validate that a private key is safe to use (basic entropy check).
     * Does NOT log the key.
     */
    static validatePrivateKey(privateKey: string): boolean {
        if (!privateKey || privateKey.length < 64) return false;
        // Ensure it's a hex string of 32 bytes
        if (!/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey)) return false;
        // Reject obviously weak keys
        const weak = ['0'.repeat(64), '1'.repeat(64), 'dead'.repeat(16)];
        return !weak.includes(privateKey.replace('0x', '').toLowerCase());
    }

    /**
     * Mask sensitive data for logging (API keys, private keys, etc.)
     */
    static maskSecret(secret: string): string {
        if (!secret || secret.length < 8) return '***';
        return secret.slice(0, 4) + '...' + secret.slice(-4);
    }
}
