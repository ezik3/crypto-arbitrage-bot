import { ProfitManager } from '../profit/profitManager';
import { MarketImpactAnalyzer } from '../market/impactAnalyzer';
import { OrderManager } from '../orders/orderManager';
import { ExchangeManager } from '../exchanges/exchangeManager';
import { FlashLoanManager } from '../defi/flashLoanManager';
import { TriangularArbitrage } from '../triangular';
import { PriceScanner } from './priceScanner';
import { config } from '../config';
import { TokenSniper } from '../sniping/tokenSniper';
import { SniperIntegration } from '../dex/integration/sniperIntegration';
import { DEX_CONFIGS, RPC_URLS } from '../config/dexConfig';
import { PairManager } from '../utils/pairManager';

type BaseAsset = 'USDT' | 'BTC' | 'ETH';

export class ArbitrageOrchestrator {
    private profitManager: ProfitManager;
    private marketAnalyzer: MarketImpactAnalyzer;
    private orderManager: OrderManager;
    private exchangeManager: ExchangeManager;
    private flashLoanManager: FlashLoanManager;
    private triangularArbitrage: TriangularArbitrage;
    private priceScanner: PriceScanner;
    private lastOpportunity: string = '';
    private lastFlashLoan: string = '';
    private lastTriangularOpp: string = '';
    private tokenSniper: TokenSniper;
    private sniperIntegration: SniperIntegration;
    private pairManager: PairManager;

    constructor() {
        this.exchangeManager = new ExchangeManager();
        
        this.profitManager = new ProfitManager();
        this.marketAnalyzer = new MarketImpactAnalyzer();
        this.orderManager = new OrderManager();
        this.flashLoanManager = new FlashLoanManager(this.exchangeManager);
        this.triangularArbitrage = new TriangularArbitrage(this.exchangeManager);
        this.priceScanner = new PriceScanner(this.exchangeManager);
        this.tokenSniper = new TokenSniper(
            process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
            process.env.LIVECOINWATCH_API_KEY || '',
            process.env.DAPPRADAR_API_KEY || '',
            process.env.QUILLAI_API_KEY || '',
            {
                minLiquidity: 50000,
                maxBuyTax: 10,
                maxSellTax: 10,
                minHolders: 50,
                minSecurityScore: 70
            }
        );

        // Add new integration
        this.sniperIntegration = new SniperIntegration(
            this.tokenSniper,
            DEX_CONFIGS,
            RPC_URLS
        );

        this.pairManager = PairManager.getInstance();
    }

    public async initialize(): Promise<void> {
        console.log('Initializing arbitrage orchestrator...');
        
        // Initialize exchanges without parameters
        await this.exchangeManager.initializeExchanges();
        
        console.log('Initializing arbitrage system...');
        await this.exchangeManager.initializeExchanges();
        console.log('Arbitrage system initialized successfully');

        // Initialize Gate.io with retry mechanism
        if (this.exchangeManager.gateio) {
            let retryCount = 0;
            while (retryCount < config.gateioSettings.retryAttempts) {
                try {
                    const pairs = await this.exchangeManager.gateio.fetchTradingPairs();
                    if (pairs.length > 0) {
                        console.log('✅ Gate.io pairs fetched successfully');
                        break;
                    }
                } catch (error) {
                    console.log(`Retry ${retryCount + 1}/${config.gateioSettings.retryAttempts} for Gate.io initialization`);
                    await new Promise(resolve => setTimeout(resolve, config.exchangePairs.gateio.options.reconnectDelay));
                }
                retryCount++;
            }
        } else {
            console.log('��️ Gate.io exchange not initialized - skipping pairs fetch');
        }
    }

    public async startArbitrageLoop(): Promise<void> {
        console.log('Starting continuous arbitrage scanning...');
        
        while (true) {
            try {
                const allPairs = this.pairManager.getAllUniquePairs();
                console.log('\n🔍 Starting new scan cycle...');
                console.log(`Scanning ${allPairs.length} trading pairs across ${config.exchanges.length} exchanges...`);
                
                // Track scan start time
                const scanStartTime = Date.now();

                // 1. Price Scanner Opportunities
                const priceOpps = await this.priceScanner.scanForArbitrageOpportunities();
                if (priceOpps.length > 0) {
                    console.log('\n💹 Price Arbitrage Opportunities:');
                    priceOpps.forEach(opp => {
                        console.log(`${opp.pair}: Buy at ${opp.buyPrice} on ${opp.buyExchange}, Sell at ${opp.sellPrice} on ${opp.sellExchange}, Profit: ${opp.profit.toFixed(2)}%`);
                    });
                }

                // 2. Regular arbitrage opportunities with market impact
                const marketData = await this.marketAnalyzer.analyzeMarketImpact({
                    timeframe: '1m',
                    minProfit: 0.5
                });

                // 3. Flash loan opportunities
                const flashLoanOpps = await this.flashLoanManager.findFlashLoanOpportunities();

                // 4. Triangular arbitrage with progress tracking
                for (const exchange of config.exchanges) {
                    console.log(`\n📊 Scanning ${exchange.name.toUpperCase()} for triangular opportunities...`);
                    const baseAssets: BaseAsset[] = ['USDT', 'BTC', 'ETH'];
                    for (const baseAsset of baseAssets) {
                        process.stdout.write(`   Scanning ${baseAsset}... `);
                        await this.triangularArbitrage.findTriangularOpportunities(exchange.name, baseAsset);
                        process.stdout.write('✓\n');
                    }
                }

                // Add token sniping scan
                await this.checkNewTokens();

                // Scan completion summary
                const scanDuration = ((Date.now() - scanStartTime) / 1000).toFixed(2);
                console.log('\n📈 Scan Cycle Summary:');
                console.log(`⏱️  Scan Duration: ${scanDuration}s`);
                console.log(`📊 Price Opportunities: ${priceOpps.length}`);
                console.log(`🔄 Market Opportunities: ${marketData.opportunities?.length || 0}`);
                console.log(`⚡ Flash Loan Opportunities: ${flashLoanOpps.opportunities?.length || 0}`);
                console.log('------------------------');

                // Dynamic delay based on market activity
                const delay = priceOpps.length > 0 ? 1000 : 3000; // Faster updates when opportunities exist
                await new Promise(resolve => setTimeout(resolve, delay));

            } catch (err: any) {
                console.error('❌ Error in arbitrage loop:', err);
                if (err instanceof Error) {
                    console.error('Stack trace:', err.stack);
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    private async checkProfitability(opportunity: any): Promise<boolean> {
        try {
            const profitAnalysis = await this.profitManager.analyzeProfitability({
                type: opportunity.type,
                pair: opportunity.pair,
                profit: opportunity.profitPercent,
                volume: opportunity.volume
            });

            return profitAnalysis.isProfitable;
        } catch (error) {
            console.error('Error checking profitability:', error);
            return false;
        }
    }

    private async logOpportunityDetails(opportunity: any, type: 'triangular' | 'flash' | 'cross'): Promise<void> {
        console.log('\n💰 Opportunity Found:');
        console.log(`📊 Type: ${type.toUpperCase()}`);
        
        if (type === 'triangular') {
            console.log(`🔄 Path: ${opportunity.path.join(' -> ')}`);
            console.log(`💵 Initial Amount: ${opportunity.initialAmount} ${opportunity.baseAsset}`);
            console.log(`📈 Expected Profit: ${opportunity.profit.toFixed(2)}%`);
            console.log(`💰 Profit Amount: ${opportunity.profitAmount.toFixed(2)} ${opportunity.baseAsset}`);
            console.log(`⛽ Estimated Gas: ${opportunity.gasEstimate} GWEI`);
            console.log(`📊 Net Profit: ${opportunity.netProfit.toFixed(2)} ${opportunity.baseAsset}\n`);
        } else if (type === 'flash') {
            console.log(`💱 Token: ${opportunity.token}`);
            console.log(`💵 Loan Amount: ${opportunity.amount}`);
            console.log(`🔄 Route: ${opportunity.route.join(' -> ')}`);
            console.log(`📈 Gross Profit: ${opportunity.profit.toFixed(2)}%`);
            console.log(`⛽ Gas Cost: ${opportunity.gasCost} ETH`);
            console.log(`📊 Net Profit: ${opportunity.netProfit.toFixed(2)} USD\n`);
        }
    }

    private async checkNewTokens(): Promise<void> {
        try {
            const newTokens = await this.tokenSniper.scanForNewTokens();
            if (newTokens.length > 0) {
                console.log('\n🔍 New Token Opportunities:');
                newTokens.forEach(token => {
                    console.log(`Token: ${token.address}`);
                    console.log(`Liquidity: $${token.liquidity}`);
                    console.log(`Security Score: ${token.securityScore}`);
                    console.log('------------------------');
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error scanning for new tokens:', errorMessage);
            // Add retry mechanism with backoff
            const retryDelay = 5000;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            await this.checkNewTokens();
        }
    }
}