import { ethers } from 'ethers';
import { LiveCoinWatchAPI } from './apis/liveCoinWatch';
import { DappRadarAPI } from './apis/dappRadar';
import { QuillAIAPI } from './apis/quillai';
import { ContractAnalyzer } from './contractAnalyzer';
import { TokenMetadata, SecurityReport, SnipingConfig } from './types/interfaces';
import { ProfitManager } from '../profit/profitManager';

export class TokenSniper {
    private provider: ethers.Provider;
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
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.liveCoinWatch = new LiveCoinWatchAPI(liveCoinWatchApiKey);
        this.dappRadar = new DappRadarAPI(dappRadarApiKey);
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

    private async analyzeToken(token: TokenMetadata) {
        try {
            // Get security analysis
            const security = await this.quillai.analyzeContract(token.address);
            
            // Get additional metrics
            const metrics = await this.quillai.getTokenMetrics(token.address);
            
            // Check if token meets our criteria
            if (this.isTokenSafe(security, metrics) && this.meetsVolumeCriteria(token)) {
                console.log(`\n🎯 Found potential token: ${token.symbol}`);
                console.log(`📊 Market Cap: $${token.marketCap?.toLocaleString()}`);
                console.log(`💧 Liquidity: $${token.liquidityAmount?.toLocaleString()}`);
                console.log(`📈 24h Volume: $${token.volume24h?.toLocaleString()}`);
                console.log(`🔒 Security Score: ${security.score}`);
                
                // Execute buy if conditions are met
                if (this.shouldBuy(token, security, metrics)) {
                    await this.executeBuy(token);
                }
            }
        } catch (error) {
            console.error(`Error analyzing token ${token.address}:`, error);
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
        const uniswapV2Factory = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'; // Uniswap V2 Factory
        const factory = new ethers.Contract(
            uniswapV2Factory,
            ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
            this.provider
        );

        factory.on('PairCreated', async (token0, token1, pair) => {
            console.log(`\n🔍 New pair detected: ${token0} - ${token1}`);
            await this.analyzeToken({ address: token0 } as TokenMetadata);
            await this.analyzeToken({ address: token1 } as TokenMetadata);
        });
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
        return (
            token.liquidityAmount >= this.config.minLiquidity &&
            (token.holders === undefined || token.holders >= this.config.minHolders)
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
            console.log(`\n🚀 Executing buy for token: ${token.symbol}`);
            // Implement your buying logic here
            // This is where you'd interact with DEX contracts to execute the trade
            
            // For now, just log the intention
            console.log(`Would execute buy for ${token.address}`);
            
            // TODO: Implement actual buying logic with your preferred DEX
            
        } catch (error) {
            console.error(`Error executing buy for token ${token.address}:`, error);
        }
    }

    // ... rest of the class implementation
}
