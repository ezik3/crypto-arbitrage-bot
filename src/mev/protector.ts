
import { ethers } from 'ethers';
import { FlashbotsManager } from '../flashbots/flashbots';

export class MevProtector {
    private flashbots: FlashbotsManager;

    constructor(provider: ethers.providers.JsonRpcProvider) {
        this.flashbots = new FlashbotsManager(provider);
    }

    async initialize(wallet: ethers.Wallet): Promise<void> {
        await this.flashbots.initialize(wallet);
    }

    async protectTransaction(
        transaction: any,
        signer: ethers.Wallet
    ): Promise<any> {
        return this.flashbots.sendBundle([{ transaction, signer }]);
    }
}
