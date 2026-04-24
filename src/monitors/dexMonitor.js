"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexMonitor = void 0;
const ethers_1 = require("ethers");
const settings_1 = require("../config/settings");
const dexScreenerApi_1 = require("../apis/dexScreenerApi");
class DexMonitor {
    constructor() {
        this.providers = new Map();
        this.factories = new Map();
        this.dexScreener = new dexScreenerApi_1.DexScreenerAPI();
        this.initializeConnections();
    }
    initializeConnections() {
        Object.entries(settings_1.Settings.chains).forEach(([chain, config]) => {
            const provider = new ethers_1.ethers.JsonRpcProvider(config.rpc);
            this.providers.set(chain, provider);
            const factory = new ethers_1.ethers.Contract(config.factoryAddress, ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'], provider);
            this.factories.set(chain, factory);
        });
    }
    async monitorNewPairs(callback) {
        console.log('🔍 Starting DEX pair monitoring...');
        // Monitor on-chain events
        for (const [chain, factory] of this.factories) {
            factory.on('PairCreated', async (token0, token1, pair) => {
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
            }
            catch (error) {
                console.error('Error monitoring DexScreener:', error);
            }
        }, 10000); // Check every 10 seconds
    }
    async handleNewPair(chain, token0, token1, pair, callback) {
        // Create token metadata for both tokens
        const tokens = [token0, token1].map(address => ({
            address,
            chain,
            pair,
            creationTime: Date.now(),
            liquidityAmount: 0,
            source: 'on-chain'
        }));
        // Process both tokens
        for (const token of tokens) {
            await callback(token);
        }
    }
    async handleDexScreenerPair(pair, callback) {
        const metadata = {
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
exports.DexMonitor = DexMonitor;
