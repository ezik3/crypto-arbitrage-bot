
import { ethers } from 'ethers';
import { MockProvider } from 'ethereum-waffle';

export class TestSetup {
    static async initialize() {
        const provider = new MockProvider();
        const [wallet] = provider.getWallets();
        
        return {
            provider,
            wallet,
            mockContracts: await this.deployMockContracts(wallet)
        };
    }
}
