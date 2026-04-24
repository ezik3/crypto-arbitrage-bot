"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbitrageOrchestrator = void 0;
const profitManager_1 = require("../profit/profitManager");
const impactAnalyzer_1 = require("../market/impactAnalyzer");
const orderManager_1 = require("../orders/orderManager");
const exchangeManager_1 = require("../exchanges/exchangeManager");
const flashLoanManager_1 = require("../defi/flashLoanManager");
const triangular_1 = require("../triangular");
const priceScanner_1 = require("./priceScanner");
const config_1 = require("../config");
const tokenSniper_1 = require("../sniping/tokenSniper");
const sniperIntegration_1 = require("../dex/integration/sniperIntegration");
const dexConfig_1 = require("../config/dexConfig");
const pairManager_1 = require("../utils/pairManager");
const executionManager_1 = require("../execution/executionManager");
const riskManager_1 = require("../risk/riskManager");
const calculator_1 = require("../fees/calculator");
// Base asset prices in USD (replace with live feed in production)
const ASSET_PRICE_USD = {
    BTC: 60000,
    ETH: 2000,
    USDT: 1,
    USDC: 1,
    SOL: 150,
    BNB: 400
};
class ArbitrageOrchestrator {
    constructor() {
        var _a;
        this.lastOpportunity = '';
        this.lastFlashLoan = '';
        this.lastTriangularOpp = '';
        // Capital management: start from the configured amount and grow
        this.capitalUsd = parseFloat((_a = process.env.INITIAL_CAPITAL_USD) !== null && _a !== void 0 ? _a : '50');
        this.exchangeManager = new exchangeManager_1.ExchangeManager();
        this.profitManager = new profitManager_1.ProfitManager();
        this.marketAnalyzer = new impactAnalyzer_1.MarketImpactAnalyzer();
        this.orderManager = new orderManager_1.OrderManager(this.exchangeManager);
        this.flashLoanManager = new flashLoanManager_1.FlashLoanManager(this.exchangeManager);
        this.triangularArbitrage = new triangular_1.TriangularArbitrage(this.exchangeManager);
        this.priceScanner = new priceScanner_1.PriceScanner(this.exchangeManager);
        this.executionManager = new executionManager_1.ExecutionManager(this.exchangeManager);
        this.riskManager = new riskManager_1.RiskManager();
        this.feeCalculator = new calculator_1.FeeCalculator();
        this.tokenSniper = new tokenSniper_1.TokenSniper(process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key', process.env.LIVECOINWATCH_API_KEY || '', process.env.DAPPRADAR_API_KEY || '', process.env.QUILLAI_API_KEY || '', {
            minLiquidity: 50000,
            maxBuyTax: 10,
            maxSellTax: 10,
            minHolders: 50,
            minSecurityScore: 70
        });
        this.sniperIntegration = new sniperIntegration_1.SniperIntegration(this.tokenSniper, dexConfig_1.DEX_CONFIGS, dexConfig_1.RPC_URLS);
        this.pairManager = pairManager_1.PairManager.getInstance();
    }
    async initialize() {
        console.log('Initializing arbitrage orchestrator...');
        await this.exchangeManager.initializeExchanges();
        console.log('Initializing arbitrage system...');
        console.log('Arbitrage system initialized successfully');
        // Initialize Gate.io with retry mechanism
        if (this.exchangeManager.gateio) {
            let retryCount = 0;
            while (retryCount < config_1.config.gateioSettings.retryAttempts) {
                try {
                    const pairs = await this.exchangeManager.gateio.fetchTradingPairs();
                    if (pairs.length > 0) {
                        console.log('✅ Gate.io pairs fetched successfully');
                        break;
                    }
                }
                catch (error) {
                    console.log(`Retry ${retryCount + 1}/${config_1.config.gateioSettings.retryAttempts} for Gate.io initialization`);
                    await new Promise(resolve => setTimeout(resolve, config_1.config.exchangePairs.gateio.options.reconnectDelay));
                }
                retryCount++;
            }
        }
        else {
            console.log('⚠️ Gate.io exchange not initialized - skipping pairs fetch');
        }
        console.log(`💰 Starting capital: $${this.capitalUsd.toFixed(2)}`);
        console.log(`🔵 Dry-run mode: ${process.env.DRY_RUN !== 'false' ? 'ON (set DRY_RUN=false to trade live)' : 'OFF — LIVE TRADING'}`);
    }
    /**
     * Scan all opportunity types and return combined results.
     * Exposed for use by the simulation runner and external callers.
     */
    async scanAllOpportunities() {
        return this.priceScanner.scanForArbitrageOpportunities();
    }
    async startArbitrageLoop() {
        var _a, _b;
        console.log('Starting continuous arbitrage scanning...');
        while (true) {
            try {
                const allPairs = this.pairManager.getAllUniquePairs();
                console.log('\n🔍 Starting new scan cycle...');
                console.log(`Scanning ${allPairs.length} trading pairs across ${config_1.config.exchanges.length} exchanges...`);
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
                for (const exchange of config_1.config.exchanges) {
                    console.log(`\n📊 Scanning ${exchange.name.toUpperCase()} for triangular opportunities...`);
                    const baseAssets = ['USDT', 'BTC', 'ETH'];
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
                console.log(`🔄 Market Opportunities: ${((_a = marketData.opportunities) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
                console.log(`⚡ Flash Loan Opportunities: ${((_b = flashLoanOpps.opportunities) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
                console.log('------------------------');
                const delay = priceOpps.length > 0 ? 1000 : 3000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            catch (err) {
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
    async executeBestOpportunity(opportunities) {
        var _a, _b, _c, _d;
        if (opportunities.length === 0)
            return;
        const ranked = this.profitManager.rankOpportunities(opportunities);
        const best = ranked[0];
        const asset = (_c = (_b = (_a = best.pair) === null || _a === void 0 ? void 0 : _a.split('/')) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : 'USDT';
        const assetPrice = (_d = ASSET_PRICE_USD[asset]) !== null && _d !== void 0 ? _d : 1;
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
        const strategy = {
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
    async checkProfitability(opportunity) {
        try {
            const profitAnalysis = await this.profitManager.analyzeProfitability({
                type: opportunity.type,
                pair: opportunity.pair,
                profit: opportunity.profitPercent,
                volume: opportunity.volume
            });
            return profitAnalysis.isProfitable;
        }
        catch (error) {
            console.error('Error checking profitability:', error);
            return false;
        }
    }
    async logOpportunityDetails(opportunity, type) {
        console.log('\n💰 Opportunity Found:');
        console.log(`📊 Type: ${type.toUpperCase()}`);
        if (type === 'triangular') {
            console.log(`🔄 Path: ${opportunity.path.join(' -> ')}`);
            console.log(`💵 Initial Amount: ${opportunity.initialAmount} ${opportunity.baseAsset}`);
            console.log(`📈 Expected Profit: ${opportunity.profit.toFixed(2)}%`);
            console.log(`💰 Profit Amount: ${opportunity.profitAmount.toFixed(2)} ${opportunity.baseAsset}`);
            console.log(`⛽ Estimated Gas: ${opportunity.gasEstimate} GWEI`);
            console.log(`📊 Net Profit: ${opportunity.netProfit.toFixed(2)} ${opportunity.baseAsset}\n`);
        }
        else if (type === 'flash') {
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
    async checkNewTokensSafe() {
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
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Error scanning for new tokens (attempt ${attempt}/${maxAttempts}):`, msg);
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
                }
            }
        }
    }
}
exports.ArbitrageOrchestrator = ArbitrageOrchestrator;
