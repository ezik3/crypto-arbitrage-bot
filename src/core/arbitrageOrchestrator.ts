import { ProfitManager } from '../profit/profitManager';
import { MarketImpactAnalyzer } from '../market/impactAnalyzer';
import { OrderManager } from '../orders/orderManager';
import { ExchangeManager } from '../exchanges/exchangeManager';
import { FlashLoanManager } from '../defi/flashLoanManager';
import { TriangularArbitrage } from '../triangular';
import { PriceScanner } from './priceScanner';
import { config } from '../config';

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

    constructor() {
        this.exchangeManager = new ExchangeManager(config.exchanges);
        
        this.profitManager = new ProfitManager();
        this.marketAnalyzer = new MarketImpactAnalyzer();
        this.orderManager = new OrderManager();
        this.flashLoanManager = new FlashLoanManager(this.exchangeManager);
        this.triangularArbitrage = new TriangularArbitrage(this.exchangeManager);
        this.priceScanner = new PriceScanner(this.exchangeManager);
    }

    public async initialize(): Promise<void> {
        try {
            console.log('Initializing arbitrage system...');
            await this.exchangeManager.initializeExchanges(config.exchanges);
            console.log('Arbitrage system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize arbitrage system:', error);
            throw error;
        }
    }

    public async startArbitrageLoop(): Promise<void> {
        console.log('Starting continuous arbitrage scanning...');
        
        while (true) {
            try {
                console.log('\n🔍 Starting new scan cycle...');
                console.log(`Scanning ${config.tradingPairs.length} trading pairs across ${config.exchanges.length} exchanges...`);
                
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
}