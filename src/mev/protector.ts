
import { ethers } from 'ethers';
import { FlashbotsManager } from '../flashbots/flashbots';

export class MevProtector {
    private flashbots: FlashbotsManager;
    
    async protectTransaction(transaction: any) {
        const bundled = await this.preparePrivateTransaction(transaction);
        return this.flashbots.sendBundle(bundled);
    }
}
