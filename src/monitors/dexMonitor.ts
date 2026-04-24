import { ethers } from 'ethers';
import { Settings } from '../config/settings';
import { TokenMetadata } from '../sniping/types/interfaces';
import { DexScreenerAPI } from '../apis/dexScreenerApi';

export class DexMonitor {
    private providers: Map<string, ethers.providers.JsonRpcProvider>;
    private factories: Map<string, ethers.Contract>;
    private dexScreener: DexScreenerAPI;

    constructor() {
        this.providers = new Map();
        this.factories = new Map();
        this.dexScreener = new DexScreenerAPI();
        this.initializeConnections();
    }

    private initializeConnections() {
        Object.entries(Settings.chains).forEach(([chain, config]) => {
            const provider = new ethers.providers.JsonRpcProvider(config.rpc);
            this.providers.set(chain, provider);

            const factory = new ethers.Contract(
                config.factoryAddress,
                ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
                provider
            );
            this.factories.set(chain, factory);
        });
    }

    async monitorNewPairs(callback: (token: TokenMetadata) => Promise<void>) {
        console.log('🔍 Starting DEX pair monitoring...');

        // Monitor on-chain events
        for (const [chain, factory] of this.factories) {
            factory.on('PairCreated', async (token0: string, token1: string, pair: string) => {
                console.log(`\n🔍 New pair detected on ${chain}: ${token0} - ${token1}`);
                await this.handleNewPair(chain, token0, token1, pair, callback);
            });
        }

        // Monitor DexScreener API
        setInterval(async () => {
            try {
                const latestPairs = await this.dexScreener.getLatestPairs();
                for (const pair of latestPairs) {
                    await this.handleDexScreenerPair(pair, callback);
                }
            } catch (error) {
                console.error('Error monitoring DexScreener:', error);
            }
        }, 10000); // Check every 10 seconds
    }

    private async handleNewPair(
        chain: string,
        token0: string,
        token1: string,
        pair: string,
        callback: (token: TokenMetadata) => Promise<void>
    ) {
        // Create token metadata for both tokens
        const tokens = [token0, token1].map(address => ({
            address,
            chain,
            pair,
            creationTime: Date.now(),
            liquidityAmount: 0,
            source: 'on-chain' as const
        }));

        // Process both tokens
        for (const token of tokens) {
            await callback(token);
        }
    }

    private async handleDexScreenerPair(
        pair: any,
        callback: (token: TokenMetadata) => Promise<void>
    ) {
        const metadata: TokenMetadata = {
            address: pair.baseToken.address,
            chain: pair.chainId,
            pair: pair.pairAddress,
            creationTime: pair.pairCreatedAt,
            liquidityAmount: pair.liquidity.usd,
            source: 'dexscreener'
        };

        await callback(metadata);
    }
}
