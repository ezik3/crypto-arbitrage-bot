import { DexMonitorService } from '../monitors/dexMonitorService';
import { PairAnalyzer } from '../services/pairAnalyzer';
import { TokenSniper } from '../../sniping/tokenSniper';
import { DexConfig } from '../interfaces/types';
import { TokenMetadata } from '../../sniping/types/interfaces';

export class SniperIntegration {
    private dexMonitor: DexMonitorService;
    private pairAnalyzer: PairAnalyzer;

    constructor(
        private readonly tokenSniper: TokenSniper,
        configs: DexConfig[],
        rpcUrls: Record<string, string[]>
    ) {
        this.dexMonitor = new DexMonitorService(configs, rpcUrls);
        this.pairAnalyzer = new PairAnalyzer(this.dexMonitor.getProvider('ethereum'), 'ethereum');
    }

    async start() {
        console.log('🚀 Starting DEX Sniper Integration...');
        
        await this.dexMonitor.startMonitoring(async (pairInfo) => {
            try {
                console.log(`\n🔍 Analyzing new pair: ${pairInfo.address}`);
                const analysis = await this.pairAnalyzer.analyzePair(pairInfo);
                
                if (analysis.isValid) {
                    console.log(`✅ Pair analysis passed for ${pairInfo.token0.symbol}-${pairInfo.token1.symbol}`);
                    
                    // Convert to TokenMetadata format for existing tokenSniper
                    const metadata: TokenMetadata = {
                        address: pairInfo.token0.address,
                        chain: pairInfo.token0.chain,
                        pair: pairInfo.address,
                        creationTime: Date.now(),
                        liquidityAmount: analysis.liquidityUSD,
                        source: 'dex-monitor',
                        securityScore: analysis.securityScore,
                        buyTax: analysis.buyTax,
                        sellTax: analysis.sellTax
                    };

                    await this.tokenSniper.analyzeToken(metadata);
                } else {
                    console.log(`❌ Pair analysis failed: ${pairInfo.token0.symbol}-${pairInfo.token1.symbol}`);
                }
            } catch (error) {
                console.error('Error in sniper integration:', error);
            }
        });
    }

    stop() {
        console.log('🛑 Stopping DEX Sniper Integration...');
        this.dexMonitor.stopMonitoring();
    }
}
