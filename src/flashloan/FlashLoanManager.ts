
// Aave V2 Lending Pool interface (inline to avoid external package dependency)
interface ILendingPool {
    flashLoan(
        receiverAddress: string,
        assets: string[],
        amounts: string[],
        modes: number[],
        onBehalfOf: string,
        params: string,
        referralCode: number
    ): Promise<any>;
}

import { config } from '../config';

export class FlashLoanManager {
    // Kept for compatibility – actual flash loan logic lives in defi/flashLoanManager.ts
    async executeFlashLoan(asset: string, amount: string) {
        // Delegated to defi/flashLoanManager.ts
    }
}
