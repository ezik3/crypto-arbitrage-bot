
import { ethers } from 'ethers';
import { FlashbotsManager } from '../flashbots/flashbots';

export class MevProtector {
    private flashbots: FlashbotsManager;
    
    constructor() {
        this.flashbots = new FlashbotsManager();
    }

    async protectTransaction(transaction: any) {
        const bundled = await this.preparePrivateTransaction(transaction);
        return this.flashbots.sendBundle(bundled);
    }

    async preparePrivateTransaction(transaction: any): Promise<any[]> { return [transaction]; }
}
