"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSniper = void 0;
const dexMonitor_1 = require("../monitors/dexMonitor");
const telegramMonitor_1 = require("../monitors/telegramMonitor");
const entryStrategy_1 = require("../strategies/entryStrategy");
const profitStrategy_1 = require("../strategies/profitStrategy");
const validation_1 = require("../utils/validation");
const blockchain_1 = require("../utils/blockchain");
const settings_1 = require("../config/settings");
const dappRadar_1 = require("./apis/dappRadar");
class TokenSniper {
    constructor(privateKey, exchangeManager) {
        this.blockchain = new blockchain_1.Blockchain(privateKey);
        this.exchangeManager = exchangeManager;
        this.dexMonitor = new dexMonitor_1.DexMonitor();
        this.telegramMonitor = new telegramMonitor_1.TelegramMonitor();
        this.entryStrategy = new entryStrategy_1.EntryStrategy(privateKey, settings_1.Settings.chains.bsc.rpc);
        this.profitStrategy = new profitStrategy_1.ProfitStrategy(exchangeManager);
        this.validator = new validation_1.TokenValidator(this.blockchain.getProvider('bsc'));
        this.dappRadar = new dappRadar_1.DappRadarAPI();
    }
    async start() {
        console.log('🚀 Starting Token Sniper...');
        // Start monitoring DEX pairs
        this.dexMonitor.monitorNewPairs(async (token) => {
            await this.handleNewToken(token);
        });
        // Start monitoring Telegram
        this.telegramMonitor.startMonitoring(async (token) => {
            await this.handleNewToken(token);
        });
    }
    async handleNewToken(token) {
        try {
            console.log(`\n🔍 Analyzing new token: ${token.address}`);
            // 1. Validate token
            const securityReport = await this.validator.validateToken(token.address);
            if (securityReport.score < settings_1.Settings.trading.minSecurityScore) {
                console.log('❌ Token failed security validation');
                return;
            }
            // 2. Evaluate entry
            const shouldEnter = await this.entryStrategy.evaluateEntry(token);
            if (!shouldEnter) {
                console.log('❌ Token failed entry criteria');
                return;
            }
            // 3. Execute entry
            const investmentAmount = this.calculateInvestmentAmount(token);
            const entrySuccess = await this.entryStrategy.executeEntry(token, investmentAmount);
            if (!entrySuccess) {
                console.log('❌ Failed to execute entry');
                return;
            }
            // 4. Setup profit taking strategy
            await this.profitStrategy.initializePosition(token.address, token.chain, investmentAmount, await this.getCurrentPrice(token));
            console.log('✅ Successfully entered position');
        }
        catch (error) {
            console.error('Error handling new token:', error);
        }
    }
    calculateInvestmentAmount(token) {
        // Implement your investment sizing logic
        return settings_1.Settings.trading.maxInvestment;
    }
    async getCurrentPrice(token) {
        try {
            const price = await this.exchangeManager.fetchPrice('default_exchange', token.address);
            return price;
        }
        catch (error) {
            console.error('Error getting current price:', error);
            throw error;
        }
    }
    async stop() {
        // Implement cleanup logic
        console.log('🛑 Stopping Token Sniper...');
    }
}
exports.TokenSniper = TokenSniper;
