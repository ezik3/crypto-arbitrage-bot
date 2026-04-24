"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = void 0;
const ethers_1 = require("ethers");
const settings_1 = require("../config/settings");
class Blockchain {
    constructor(privateKey) {
        this.providers = new Map();
        this.wallets = new Map();
        this.initializeConnections(privateKey);
    }
    initializeConnections(privateKey) {
        Object.entries(settings_1.Settings.chains).forEach(([chain, config]) => {
            // Initialize provider
            const provider = new ethers_1.ethers.JsonRpcProvider(config.rpc);
            this.providers.set(chain, provider);
            // Initialize wallet
            const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
            this.wallets.set(chain, wallet);
        });
    }
    async getGasPrice(chain) {
        try {
            const provider = this.providers.get(chain);
            if (!provider)
                throw new Error(`No provider for chain: ${chain}`);
            const gasPrice = await provider.getFeeData();
            return gasPrice.gasPrice || 0n;
        }
        catch (error) {
            console.error(`Error getting gas price for ${chain}:`, error);
            throw error;
        }
    }
    async isContractVerified(chain, address) {
        // Implement contract verification check using appropriate block explorer API
        return true; // Placeholder
    }
    async getTokenContract(chain, address) {
        const provider = this.providers.get(chain);
        if (!provider)
            throw new Error(`No provider for chain: ${chain}`);
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
        return new ethers_1.ethers.Contract(address, abi, provider);
    }
    async estimateGas(chain, to, data, value = 0n) {
        try {
            const provider = this.providers.get(chain);
            if (!provider)
                throw new Error(`No provider for chain: ${chain}`);
            const wallet = this.wallets.get(chain);
            if (!wallet)
                throw new Error(`No wallet for chain: ${chain}`);
            const estimate = await provider.estimateGas({
                from: wallet.address,
                to,
                data,
                value
            });
            return estimate;
        }
        catch (error) {
            console.error(`Error estimating gas for ${chain}:`, error);
            throw error;
        }
    }
    async sendTransaction(chain, to, data, value = 0n) {
        try {
            const wallet = this.wallets.get(chain);
            if (!wallet)
                throw new Error(`No wallet for chain: ${chain}`);
            const gasPrice = await this.getGasPrice(chain);
            const gasLimit = settings_1.Settings.chains[chain].gasLimit;
            const tx = await wallet.sendTransaction({
                to,
                data,
                value,
                gasLimit,
                gasPrice
            });
            return tx;
        }
        catch (error) {
            console.error(`Error sending transaction on ${chain}:`, error);
            throw error;
        }
    }
    async waitForTransaction(chain, txHash, confirmations = 1) {
        const provider = this.providers.get(chain);
        if (!provider)
            throw new Error(`No provider for chain: ${chain}`);
        return await provider.waitForTransaction(txHash, confirmations);
    }
    getProvider(chain) {
        return this.providers.get(chain);
    }
    getWallet(chain) {
        return this.wallets.get(chain);
    }
}
exports.Blockchain = Blockchain;
