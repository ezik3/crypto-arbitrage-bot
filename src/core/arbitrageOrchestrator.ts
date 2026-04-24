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
import { ExecutionManager, ExecutionStrategy } from '../execution/executionManager';
import { RiskManager } from '../risk/riskManager';
import { FeeCalculator } from '../fees/calculator';

type BaseAsset = 'USDT' | 'BTC' | 'ETH';

// Base asset prices in USD (replace with live feed in production)
const ASSET_PRICE_USD: Record<string, number> = {
    BTC: 60000,
    ETH: 2000,
    USDT: 1,
    USDC: 1,
    SOL: 150,
    BNB: 400
};

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
    private executionManager: ExecutionManager;
    private riskManager: RiskManager;
    private feeCalculator: FeeCalculator;

    // Capital management: start from the configured amount and grow
    private capitalUsd: number = parseFloat(process.env.INITIAL_CAPITAL_USD ?? '50');

    constructor() {
        this.exchangeManager = new ExchangeManager();

        this.profitManager = new ProfitManager();
        this.marketAnalyzer = new MarketImpactAnalyzer();
        this.orderManager = new OrderManager(this.exchangeManager);
        this.flashLoanManager = new FlashLoanManager(this.exchangeManager);
        this.triangularArbitrage = new TriangularArbitrage(this.exchangeManager);
        this.priceScanner = new PriceScanner(this.exchangeManager);
        this.executionManager = new ExecutionManager(this.exchangeManager);
        this.riskManager = new RiskManager();
        this.feeCalculator = new FeeCalculator();

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

        this.sniperIntegration = new SniperIntegration(
            this.tokenSniper,
            DEX_CONFIGS,
            RPC_URLS
        );

        this.pairManager = PairManager.getInstance();
    }

    public async initialize(): Promise<void> {
        console.log('Initializing arbitrage orchestrator...');

        await this.exchangeManager.initializeExchanges();

        console.log('Initializing arbitrage system...');
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
            console.log('⚠️ Gate.io exchange not initialized - skipping pairs fetch');
        }

        console.log(`💰 Starting capital: $${this.capitalUsd.toFixed(2)}`);
        console.log(`🔵 Dry-run mode: ${process.env.DRY_RUN !== 'false' ? 'ON (set DRY_RUN=false to trade live)' : 'OFF — LIVE TRADING'}`);
    }

    /**
     * Scan all opportunity types and return combined results.
     * Exposed for use by the simulation runner and external callers.
     */
    public async scanAllOpportunities(): Promise<any[]> {
        return this.priceScanner.scanForArbitrageOpportunities();
    }

    public async startArbitrageLoop(): Promise<void> {
        console.log('Starting continuous arbitrage scanning...');

        while (true) {
            try {
                const allPairs = this.pairManager.getAllUniquePairs();
                console.log('\n🔍 Starting new scan cycle...');
                console.log(`Scanning ${allPairs.length} trading pairs across ${config.exchanges.length} exchanges...`);
                console.log(`💰 Current capital: $${this.capitalUsd.toFixed(2)}`);

                const scanStartTime = Date.now();

                // 1. Price Scanner (cross-exchange) Opportunities
                const priceOpps = await this.priceScanner.scanForArbitrageOpportunities();
                if (priceOpps.length > 0) {
                    console.log('\n💹 Price Arbitrage Opportunities:');
                    priceOpps.forEach(opp => {
                        console.log(`${opp.pair}: Buy at ${opp.buyPrice} on ${opp.buyExchange}, Sell at ${opp.sellPrice} on ${opp.sellExchange}, Profit: ${opp.profit.toFixed(2)}%`);
                    });

                    // Execute the most profitable opportunity after risk/fee checks
                    await this.executeBestOpportunity(priceOpps);
                }

                // 2. Market impact analysis
                const marketData = await this.marketAnalyzer.analyzeMarketImpact({
                    timeframe: '1m',
                    minProfit: 0.5
                });

                // 3. Flash loan opportunities
                const flashLoanOpps = await this.flashLoanManager.findFlashLoanOpportunities();
                if (flashLoanOpps.opportunities.length > 0) {
                    console.log('\n⚡ Flash Loan Opportunities:');
                    flashLoanOpps.opportunities.forEach(opp => {
                        console.log(`  ${opp.token}: Loan ${opp.amount} → Net Profit $${opp.netProfit.toFixed(2)}`);
                    });
                }

                // 4. Triangular arbitrage
                for (const exchange of config.exchanges) {
                    console.log(`\n📊 Scanning ${exchange.name.toUpperCase()} for triangular opportunities...`);
                    const baseAssets: BaseAsset[] = ['USDT', 'BTC', 'ETH'];
                    for (const baseAsset of baseAssets) {
                        process.stdout.write(`   Scanning ${baseAsset}... `);
                        await this.triangularArbitrage.findTriangularOpportunities(exchange.name, baseAsset);
                        process.stdout.write('✓\n');
                    }
                }

                // 5. Token sniping (no infinite recursion)
                await this.checkNewTokensSafe();

                const scanDuration = ((Date.now() - scanStartTime) / 1000).toFixed(2);
                console.log('\n📈 Scan Cycle Summary:');
                console.log(`⏱️  Scan Duration: ${scanDuration}s`);
                console.log(`📊 Price Opportunities: ${priceOpps.length}`);
                console.log(`🔄 Market Opportunities: ${marketData.opportunities?.length || 0}`);
                console.log(`⚡ Flash Loan Opportunities: ${flashLoanOpps.opportunities?.length || 0}`);
                console.log('------------------------');

                const delay = priceOpps.length > 0 ? 1000 : 3000;
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

    /**
     * Execute the single best cross-exchange opportunity after risk and fee checks.
     */
    private async executeBestOpportunity(opportunities: any[]): Promise<void> {
        if (opportunities.length === 0) return;

        const ranked = this.profitManager.rankOpportunities(opportunities);
        const best = ranked[0];

        const asset = best.pair?.split('/')?.[0] ?? 'USDT';
        const assetPrice = ASSET_PRICE_USD[asset] ?? 1;
        const tradeSize = this.riskManager.getRecommendedTradeSize(this.capitalUsd);
        const amount = tradeSize / (best.buyPrice || 1);

        // Fee-aware profitability check
        const profitResult = await this.profitManager.analyzeProfitability({
            type: 'cross',
            pair: best.pair,
            profit: best.profit,
            volume: tradeSize,
            buyExchange: best.buyExchange,
            sellExchange: best.sellExchange,
            assetPriceUsd: assetPrice
        });

        if (!profitResult.isProfitable) {
            console.log(`💸 ${best.pair} unprofitable after fees (net: $${profitResult.netProfitUsd.toFixed(4)})`);
            return;
        }

        const strategy: ExecutionStrategy = {
            type: 'cross',
            pair: best.pair,
            buyExchange: best.buyExchange,
            sellExchange: best.sellExchange,
            buyPrice: best.buyPrice,
            sellPrice: best.sellPrice,
            amount,
            tradeAmountUsd: tradeSize,
            profitPercent: best.profit,
            capitalUsd: this.capitalUsd
        };

        const result = await this.executionManager.executeStrategy(strategy);

        if (result.success && result.netProfitUsd > 0) {
            this.capitalUsd += result.netProfitUsd;
            console.log(`💰 Capital updated: $${this.capitalUsd.toFixed(2)} (+$${result.netProfitUsd.toFixed(4)})`);
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

    /**
     * Token sniping with bounded retries — no infinite recursion.
     */
    private async checkNewTokensSafe(): Promise<void> {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
                return;
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Error scanning for new tokens (attempt ${attempt}/${maxAttempts}):`, msg);
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
                }
            }
        }
    }
}
