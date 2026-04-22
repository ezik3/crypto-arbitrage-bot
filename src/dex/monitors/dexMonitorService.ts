import { ethers } from 'ethers';
import { DexConfig, PairInfo } from '../interfaces/types';
import { TokenValidator } from '../../utils/validation';

export class DexMonitorService {
    private providers: Map<string, ethers.providers.JsonRpcProvider> = new Map();
    private factories: Map<string, ethers.Contract> = new Map();
    private validator: TokenValidator;

    constructor(
        private readonly configs: DexConfig[],
        private readonly rpcUrls: Record<string, string[]>
    ) {
        this.initializeProviders();
        this.validator = new TokenValidator(this.providers.get('bsc')!);
    }

    private initializeProviders() {
        Object.entries(this.rpcUrls).forEach(([chain, urls]) => {
            // Use multiple providers per chain for redundancy
            urls.forEach(url => {
                const provider = new ethers.providers.JsonRpcProvider(url);
                this.providers.set(chain, provider);
            });
        });
    }

    public async startMonitoring(callback: (pairInfo: PairInfo) => Promise<void>) {
        for (const config of this.configs) {
            await this.monitorDex(config, callback);
        }
    }

    private async monitorDex(
        config: DexConfig, 
        callback: (pairInfo: PairInfo) => Promise<void>
    ) {
        const provider = this.providers.get(config.chain);
        if (!provider) {
            throw new Error(`No provider found for chain ${config.chain}`);
        }

        const factory = new ethers.Contract(
            config.factoryAddress,
            ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
            provider
        );

        factory.on('PairCreated', async (token0, token1, pair, _) => {
            try {
                const pairInfo = await this.getPairInfo(
                    config.chain,
                    pair,
                    token0,
                    token1
                );
                
                await callback(pairInfo);
            } catch (error) {
                console.error(`Error processing new pair: ${error}`);
            }
        });

        this.factories.set(config.name, factory);
    }

    private async getPairInfo(
        chain: string,
        pairAddress: string,
        token0Address: string,
        token1Address: string
    ): Promise<PairInfo> {
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

        const pair = new ethers.Contract(pairAddress, pairABI, provider);
        const reserves = await pair.getReserves();

        // Get token details
        const [token0Contract, token1Contract] = await Promise.all([
            new ethers.Contract(token0Address, tokenABI, provider),
            new ethers.Contract(token1Address, tokenABI, provider)
        ]);

        const [
            token0Symbol,
            token0Name,
            token0Decimals,
            token0Supply,
            token1Symbol,
            token1Name,
            token1Decimals,
            token1Supply
        ] = await Promise.all([
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

    private async retryOperation<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3
    ): Promise<T> {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
        throw lastError;
    }

    public getProvider(chain: string): ethers.providers.JsonRpcProvider {
        const provider = this.providers.get(chain);
        if (!provider) {
            throw new Error(`No provider found for chain ${chain}`);
        }
        return provider;
    }

    public async stopMonitoring(): Promise<void> {
        for (const [_, factory] of this.factories) {
            factory.removeAllListeners('PairCreated');
        }
        this.factories.clear();
    }
}
