import { ethers } from 'ethers';
import { DexMonitor } from '../monitors/dexMonitor';
import { TelegramMonitor } from '../monitors/telegramMonitor';
import { EntryStrategy } from '../strategies/entryStrategy';
import { ProfitStrategy } from '../strategies/profitStrategy';
import { TokenValidator } from '../utils/validation';
import { Blockchain } from '../utils/blockchain';
import { Settings } from '../config/settings';
import { TokenMetadata, SecurityReport } from './types/interfaces';
import { ExchangeManager } from '../exchanges/exchangeManager';
import { DappRadarAPI } from './apis/dappRadar';

export class TokenSniper {
    private dexMonitor: DexMonitor;
    private telegramMonitor: TelegramMonitor;
    private entryStrategy: EntryStrategy;
    private profitStrategy: ProfitStrategy;
    private validator: TokenValidator;
    private blockchain: Blockchain;
    private exchangeManager: ExchangeManager;
    private dappRadar: DappRadarAPI;

    constructor(
        privateKey: string,
        exchangeManager: ExchangeManager
    ) {
        this.blockchain = new Blockchain(privateKey);
        this.exchangeManager = exchangeManager;
        this.dexMonitor = new DexMonitor();
        this.telegramMonitor = new TelegramMonitor();
        this.entryStrategy = new EntryStrategy(privateKey, Settings.chains.bsc.rpc);
        this.profitStrategy = new ProfitStrategy(exchangeManager);
        this.validator = new TokenValidator(this.blockchain.getProvider('bsc')!);
        this.dappRadar = new DappRadarAPI();
    }

    async start() {
        console.log('🚀 Starting Token Sniper...');

        // Start monitoring DEX pairs
        this.dexMonitor.monitorNewPairs(async (token: TokenMetadata) => {
            await this.handleNewToken(token);
        });

        // Start monitoring Telegram
        this.telegramMonitor.startMonitoring(async (token: TokenMetadata) => {
            await this.handleNewToken(token);
        });
    }

    private async handleNewToken(token: TokenMetadata) {
        try {
            console.log(`\n🔍 Analyzing new token: ${token.address}`);

            // 1. Validate token
            const securityReport = await this.validator.validateToken(token.address);
            if (securityReport.score < Settings.trading.minSecurityScore) {
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
            await this.profitStrategy.initializePosition(
                token.address,
                token.chain,
                investmentAmount,
                await this.getCurrentPrice(token)
            );

            console.log('✅ Successfully entered position');

        } catch (error) {
            console.error('Error handling new token:', error);
        }
    }

    private calculateInvestmentAmount(token: TokenMetadata): number {
        // Implement your investment sizing logic
        return Settings.trading.maxInvestment;
    }

    private async getCurrentPrice(token: TokenMetadata): Promise<number> {
        try {
            const price = await this.exchangeManager.fetchPrice(
                'default_exchange',
                token.address
            );
            return price;
        } catch (error) {
            console.error('Error getting current price:', error);
            throw error;
        }
    }

    async stop() {
        // Implement cleanup logic
        console.log('🛑 Stopping Token Sniper...');
    }
}
