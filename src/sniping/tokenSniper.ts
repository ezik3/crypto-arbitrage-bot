import { providers, Contract } from 'ethers';
import { LiveCoinWatchAPI } from './apis/liveCoinWatch';
import { DappRadarAPI } from './apis/dappRadar';
import { QuillAIAPI } from './apis/quillai';
import { ContractAnalyzer } from './contractAnalyzer';
import { TokenMetadata, SecurityReport, SnipingConfig } from '../sniping/types/interfaces';
import { ProfitManager } from '../profit/profitManager';

export class TokenSniper {
    private provider: providers.JsonRpcProvider;
    private liveCoinWatch: LiveCoinWatchAPI;
    private dappRadar: DappRadarAPI;
    private quillai: QuillAIAPI;
    private contractAnalyzer: ContractAnalyzer;
    private profitManager: ProfitManager;
    private config: SnipingConfig;

    constructor(
        rpcUrl: string, 
        liveCoinWatchApiKey: string,
        dappRadarApiKey: string,
        quillaiApiKey: string,
        config: SnipingConfig
    ) {
        this.provider = new providers.JsonRpcProvider(rpcUrl);
        this.liveCoinWatch = new LiveCoinWatchAPI(liveCoinWatchApiKey);
        this.dappRadar = new DappRadarAPI();
        this.quillai = new QuillAIAPI(quillaiApiKey);
        this.contractAnalyzer = new ContractAnalyzer(rpcUrl, quillaiApiKey);
        this.profitManager = new ProfitManager();
        this.config = config;
    }

    async startSniper() {
        console.log('🎯 Starting token sniper...');
        
        // Listen to DEX events for new pairs
        this.listenToNewPairs();
        
        // Also periodically check LiveCoinWatch for new tokens
        setInterval(async () => {
            const newTokens = await this.liveCoinWatch.getNewTokens();
            for (const token of newTokens) {
                await this.analyzeToken(token);
            }
        }, 2000); // Check every 2 seconds
    }

    public async analyzeToken(token: TokenMetadata): Promise<void> {
        try {
            const security = await this.quillai.analyzeContract(token.address);
            const metrics = await this.quillai.getTokenMetrics(token.address);
            
            if (this.isTokenSafe(security, metrics) && this.meetsVolumeCriteria(token)) {
                console.log(`\n🎯 Found potential token: ${token.symbol || token.address}`);
                console.log(`📊 Market Cap: $${token.marketCap?.toLocaleString() || 'Unknown'}`);
                console.log(`💧 Liquidity: $${token.liquidityAmount?.toLocaleString() || 'Unknown'}`);
                console.log(`📈 24h Volume: $${token.volume24h?.toLocaleString() || 'Unknown'}`);
                console.log(`🔒 Security Score: ${security.score}`);
                
                if (this.shouldBuy(token, security, metrics)) {
                    await this.executeBuy(token);
                }
            }
        } catch (error) {
            console.error('Error analyzing token:', error);
        }
    }

    async testApiConnection() {
        try {
            const response = await this.liveCoinWatch.getNewTokens();
            console.log('LiveCoinWatch API connection successful!');
            console.log(`Found ${response.length} new tokens`);
            return true;
        } catch (error) {
            console.error('LiveCoinWatch API connection failed:', error);
            return false;
        }
    }

    private async listenToNewPairs() {
        const uniswapV2Factory = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
        const factory = new Contract(
            uniswapV2Factory,
            ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
            this.provider
        );

        factory.on('PairCreated', 
            async (
                token0: string,
                token1: string,
                pair: string
            ) => {
                console.log(`\n🔍 New pair detected: ${token0} - ${token1}`);
                await this.analyzeToken({ address: token0 } as TokenMetadata);
                await this.analyzeToken({ address: token1 } as TokenMetadata);
            }
        );
    }

    private isTokenSafe(security: SecurityReport, metrics: any): boolean {
        return (
            !security.isHoneypot &&
            security.score >= this.config.minSecurityScore &&
            security.liquidityLocked &&
            security.contractVerified &&
            metrics.buyTax <= this.config.maxBuyTax &&
            metrics.sellTax <= this.config.maxSellTax
        );
    }

    private meetsVolumeCriteria(token: TokenMetadata): boolean {
        const minLiquidity = this.config.minLiquidity;
        const minHolders = this.config.minHolders;
        
        return (
            (token.liquidityAmount ?? 0) >= minLiquidity &&
            (token.holders === undefined || token.holders >= minHolders)
        );
    }

    private shouldBuy(token: TokenMetadata, security: SecurityReport, metrics: any): boolean {
        return (
            this.isTokenSafe(security, metrics) &&
            this.meetsVolumeCriteria(token) &&
            metrics.riskLevel !== 'HIGH'
        );
    }

    private async executeBuy(token: TokenMetadata) {
        try {
            console.log(`\n Executing buy for token: ${token.symbol || token.address}`);
            console.log(`Would execute buy for ${token.address}`);
        } catch (error) {
            console.error(`Error executing buy for token ${token.address}:`, error);
        }
    }

    async scanForNewTokens(): Promise<TokenMetadata[]> {
        try {
            const tokens = await this.dappRadar.getNewTokens();
            return tokens.map(token => {
                const baseToken: TokenMetadata = {
                    address: token.address || '',
                    chain: 'ETH',
                    creationTime: Date.now(),
                    source: 'dappradar',
                    liquidityAmount: token.liquidity,
                    securityScore: token.securityScore,
                    buyTax: token.buyTax,
                    sellTax: token.sellTax,
                    holders: token.holders,
                    symbol: token.symbol,
                    name: token.name,
                    marketCap: token.marketCap,
                    volume24h: token.volume24h,
                    pair: token.pair,
                    rate: token.rate
                };
                return baseToken;
            });
        } catch (error) {
            console.error('Token scanning error:', error);
            return [];
        }
    }

    // ... rest of the class implementation
}
