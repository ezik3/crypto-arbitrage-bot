import { ethers } from 'ethers';
import { Settings } from '../config/settings';

export class Blockchain {
    private providers: Map<string, ethers.Provider>;
    private wallets: Map<string, ethers.Wallet>;

    constructor(privateKey: string) {
        this.providers = new Map();
        this.wallets = new Map();
        this.initializeConnections(privateKey);
    }

    private initializeConnections(privateKey: string) {
        Object.entries(Settings.chains).forEach(([chain, config]) => {
            // Initialize provider
            const provider = new ethers.JsonRpcProvider(config.rpc);
            this.providers.set(chain, provider);

            // Initialize wallet
            const wallet = new ethers.Wallet(privateKey, provider);
            this.wallets.set(chain, wallet);
        });
    }

    async getGasPrice(chain: string): Promise<bigint> {
        try {
            const provider = this.providers.get(chain);
            if (!provider) throw new Error(`No provider for chain: ${chain}`);

            const gasPrice = await provider.getFeeData();
            return gasPrice.gasPrice || 0n;
        } catch (error) {
            console.error(`Error getting gas price for ${chain}:`, error);
            throw error;
        }
    }

    async isContractVerified(chain: string, address: string): Promise<boolean> {
        // Implement contract verification check using appropriate block explorer API
        return true; // Placeholder
    }

    async getTokenContract(chain: string, address: string): Promise<ethers.Contract> {
        const provider = this.providers.get(chain);
        if (!provider) throw new Error(`No provider for chain: ${chain}`);

        const abi = [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function decimals() view returns (uint8)',
            'function totalSupply() view returns (uint256)',
            'function balanceOf(address) view returns (uint256)',
            'function transfer(address to, uint amount) returns (bool)',
            'function allowance(address owner, address spender) view returns (uint256)',
            'function approve(address spender, uint amount) returns (bool)',
            'event Transfer(address indexed from, address indexed to, uint amount)'
        ];

        return new ethers.Contract(address, abi, provider);
    }

    async estimateGas(
        chain: string,
        to: string,
        data: string,
        value: bigint = 0n
    ): Promise<bigint> {
        try {
            const provider = this.providers.get(chain);
            if (!provider) throw new Error(`No provider for chain: ${chain}`);

            const wallet = this.wallets.get(chain);
            if (!wallet) throw new Error(`No wallet for chain: ${chain}`);

            const estimate = await provider.estimateGas({
                from: wallet.address,
                to,
                data,
                value
            });

            return estimate;
        } catch (error) {
            console.error(`Error estimating gas for ${chain}:`, error);
            throw error;
        }
    }

    async sendTransaction(
        chain: string,
        to: string,
        data: string,
        value: bigint = 0n
    ): Promise<ethers.TransactionResponse> {
        try {
            const wallet = this.wallets.get(chain);
            if (!wallet) throw new Error(`No wallet for chain: ${chain}`);

            const gasPrice = await this.getGasPrice(chain);
            const gasLimit = Settings.chains[chain].gasLimit;

            const tx = await wallet.sendTransaction({
                to,
                data,
                value,
                gasLimit,
                gasPrice
            });

            return tx;
        } catch (error) {
            console.error(`Error sending transaction on ${chain}:`, error);
            throw error;
        }
    }

    async waitForTransaction(
        chain: string,
        txHash: string,
        confirmations: number = 1
    ): Promise<ethers.TransactionReceipt> {
        const provider = this.providers.get(chain);
        if (!provider) throw new Error(`No provider for chain: ${chain}`);

        return await provider.waitForTransaction(txHash, confirmations);
    }

    getProvider(chain: string): ethers.Provider | undefined {
        return this.providers.get(chain);
    }

    getWallet(chain: string): ethers.Wallet | undefined {
        return this.wallets.get(chain);
    }
}
