"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexMonitorService = void 0;
const ethers_1 = require("ethers");
const validation_1 = require("../../utils/validation");
class DexMonitorService {
    constructor(configs, rpcUrls) {
        this.configs = configs;
        this.rpcUrls = rpcUrls;
        this.providers = new Map();
        this.factories = new Map();
        this.initializeProviders();
        this.validator = new validation_1.TokenValidator(this.providers.get('bsc'));
    }
    initializeProviders() {
        Object.entries(this.rpcUrls).forEach(([chain, urls]) => {
            // Use multiple providers per chain for redundancy
            urls.forEach(url => {
                const provider = new ethers_1.ethers.providers.JsonRpcProvider(url);
                this.providers.set(chain, provider);
            });
        });
    }
    async startMonitoring(callback) {
        for (const config of this.configs) {
            await this.monitorDex(config, callback);
        }
    }
    async monitorDex(config, callback) {
        const provider = this.providers.get(config.chain);
        if (!provider) {
            throw new Error(`No provider found for chain ${config.chain}`);
        }
        const factory = new ethers_1.ethers.Contract(config.factoryAddress, ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'], provider);
        factory.on('PairCreated', async (token0, token1, pair, _) => {
            try {
                const pairInfo = await this.getPairInfo(config.chain, pair, token0, token1);
                await callback(pairInfo);
            }
            catch (error) {
                console.error(`Error processing new pair: ${error}`);
            }
        });
        this.factories.set(config.name, factory);
    }
    async getPairInfo(chain, pairAddress, token0Address, token1Address) {
        const provider = this.providers.get(chain);
        if (!provider) {
            throw new Error(`No provider found for chain ${chain}`);
        }
        const pairABI = [
            'function token0() external view returns (address)',
            'function token1() external view returns (address)',
            'function getReserves() external view returns (uint112, uint112, uint32)',
            'function decimals() external view returns (uint8)'
        ];
        const tokenABI = [
            'function name() external view returns (string)',
            'function symbol() external view returns (string)',
            'function decimals() external view returns (uint8)',
            'function totalSupply() external view returns (uint256)'
        ];
        const pair = new ethers_1.ethers.Contract(pairAddress, pairABI, provider);
        const reserves = await pair.getReserves();
        // Get token details
        const [token0Contract, token1Contract] = await Promise.all([
            new ethers_1.ethers.Contract(token0Address, tokenABI, provider),
            new ethers_1.ethers.Contract(token1Address, tokenABI, provider)
        ]);
        const [token0Symbol, token0Name, token0Decimals, token0Supply, token1Symbol, token1Name, token1Decimals, token1Supply] = await Promise.all([
            token0Contract.symbol(),
            token0Contract.name(),
            token0Contract.decimals(),
            token0Contract.totalSupply(),
            token1Contract.symbol(),
            token1Contract.name(),
            token1Contract.decimals(),
            token1Contract.totalSupply()
        ]);
        return {
            address: pairAddress,
            token0: {
                address: token0Address,
                symbol: token0Symbol,
                name: token0Name,
                decimals: token0Decimals,
                totalSupply: token0Supply.toString(),
                chain
            },
            token1: {
                address: token1Address,
                symbol: token1Symbol,
                name: token1Name,
                decimals: token1Decimals,
                totalSupply: token1Supply.toString(),
                chain
            },
            reserve0: reserves[0].toString(),
            reserve1: reserves[1].toString(),
            timestamp: reserves[2]
        };
    }
    async retryOperation(operation, maxRetries = 3) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
        throw lastError;
    }
    getProvider(chain) {
        const provider = this.providers.get(chain);
        if (!provider) {
            throw new Error(`No provider found for chain ${chain}`);
        }
        return provider;
    }
    async stopMonitoring() {
        for (const [_, factory] of this.factories) {
            factory.removeAllListeners('PairCreated');
        }
        this.factories.clear();
    }
}
exports.DexMonitorService = DexMonitorService;
