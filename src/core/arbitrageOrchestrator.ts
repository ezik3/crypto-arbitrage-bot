import { ProfitManager } from '../profit/profitManager';
import { MarketImpactAnalyzer } from '../market/impactAnalyzer';
import { OrderManager } from '../orders/orderManager';
import { ExchangeManager } from '../exchanges/exchangeManager';
import { FlashLoanManager } from '../defi/flashLoanManager';
import { TriangularArbitrage } from '../triangular';
import { config } from '../config';

export class ArbitrageOrchestrator {
    private profitManager: ProfitManager;
    private marketAnalyzer: MarketImpactAnalyzer;
    private orderManager: OrderManager;
    private exchangeManager: ExchangeManager;
    private flashLoanManager: FlashLoanManager;
    private triangularArbitrage: TriangularArbitrage;
    private lastOpportunity: string = '';
    private lastFlashLoan: string = '';
    private lastTriangularOpp: string = '';

    constructor() {
        this.exchangeManager = new ExchangeManager(config.exchanges);
        
        this.profitManager = new ProfitManager();
        this.marketAnalyzer = new MarketImpactAnalyzer();
        this.orderManager = new OrderManager();
        this.flashLoanManager = new FlashLoanManager();
        this.triangularArbitrage = new TriangularArbitrage(this.exchangeManager);
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
        while (true) {
            try {
                // 1. Regular arbitrage opportunities
                const marketData = await this.marketAnalyzer.analyzeMarketImpact({
                    timeframe: '1m',
                    minProfit: 0.5
                });

                // 2. Flash loan opportunities
                const flashLoanOpps = await this.flashLoanManager.findFlashLoanOpportunities();

                // 3. Triangular arbitrage opportunities for each exchange
                const triangularOpps = [];
                for (const exchange of config.exchanges) {
                    const baseAssets = ['USDT', 'USDC', 'BUSD', 'DAI', 'BTC', 'ETH'];
                    for (const baseAsset of baseAssets) {
                        await this.triangularArbitrage.findTriangularOpportunities(exchange.name, baseAsset);
                    }
                }

                // Process regular arbitrage opportunities
                const currentOpp = JSON.stringify(marketData.opportunities);
                if (currentOpp !== this.lastOpportunity && marketData.opportunities.length > 0) {
                    console.log('\n💰 New Cross-Exchange Arbitrage Opportunities:');
                    marketData.opportunities.forEach(opp => {
                        console.log(`${opp.pair}: Buy on ${opp.buyExchange}, Sell on ${opp.sellExchange}, Profit: ${opp.profitPercent.toFixed(2)}%`);
                    });
                    this.lastOpportunity = currentOpp;
                }

                // Process flash loan opportunities
                const currentFlash = JSON.stringify(flashLoanOpps);
                if (currentFlash !== this.lastFlashLoan && flashLoanOpps.opportunities.length > 0) {
                    console.log('\n🚀 New Flash Loan Opportunities:');
                    flashLoanOpps.opportunities.forEach(opp => {
                        console.log(`Protocol: ${opp.protocol}, Asset: ${opp.asset}, Amount: ${opp.amount}, Expected Profit: ${opp.expectedProfit}`);
                    });
                    this.lastFlashLoan = currentFlash;
                }

                // Add small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error('Error in arbitrage loop:', error);
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
}