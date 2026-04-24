"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramMonitor = void 0;
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const ethers_1 = require("ethers");
const settings_1 = require("../config/settings");
const input_1 = __importDefault(require("input"));
const events_1 = require("telegram/events");
class TelegramMonitor {
    constructor() {
        this.tokenPattern = /0x[a-fA-F0-9]{40}/g;
        this.isMonitoring = false;
        console.log('📱 Initializing Telegram Monitor...');
        const apiId = parseInt(settings_1.Settings.telegram.apiId || '0');
        const apiHash = settings_1.Settings.telegram.apiHash;
        if (!apiId || !apiHash) {
            console.error('❌ Missing Telegram credentials:', {
                apiId: !!apiId,
                apiHash: !!apiHash
            });
            throw new Error('Telegram API credentials not configured');
        }
        console.log('✅ Telegram credentials found');
        console.log('📋 Channels to monitor:', settings_1.Settings.telegram.channels);
        this.stringSession = new sessions_1.StringSession('');
        this.client = new telegram_1.TelegramClient(this.stringSession, apiId, apiHash, {
            connectionRetries: 5,
            useWSS: true,
            baseLogger: console
        });
    }
    async startMonitoring(callback) {
        if (this.isMonitoring) {
            console.log('⚠️ Monitor already running');
            return;
        }
        try {
            console.log('🔄 Starting Telegram monitor...');
            await this.client.connect();
            console.log('✅ Connected to Telegram');
            if (!await this.client.isUserAuthorized()) {
                console.log('🔑 Starting authentication...');
                const phone = await input_1.default.text('Enter your phone number: ');
                const code = await this.client.sendCode({
                    apiId: parseInt(settings_1.Settings.telegram.apiId || '0'),
                    apiHash: settings_1.Settings.telegram.apiHash || '',
                }, phone);
                const userCode = await input_1.default.text('Enter the code you received: ');
                await this.client.signIn({
                    phoneNumber: phone,
                    phoneCodeHash: code.phoneCodeHash,
                    phoneCode: userCode,
                });
                console.log('✅ Authentication successful');
            }
            this.isMonitoring = true;
            console.log('🎯 Starting channel monitoring...');
            for (const channelId of settings_1.Settings.telegram.channels) {
                try {
                    console.log(`🔍 Attempting to monitor channel: ${channelId}`);
                    const channel = await this.client.getEntity(channelId);
                    console.log(`✅ Successfully connected to channel: ${channelId}`);
                    this.client.addEventHandler(async (event) => {
                        var _a;
                        if ((_a = event.message) === null || _a === void 0 ? void 0 : _a.message) {
                            const addresses = this.extractTokenAddresses(event.message.message);
                            for (const address of addresses) {
                                if (ethers_1.ethers.isAddress(address)) {
                                    await callback({
                                        address,
                                        chain: this.detectChain(event.message.message),
                                        creationTime: Date.now(),
                                        liquidityAmount: 0,
                                        source: 'telegram',
                                        channelId: channelId
                                    });
                                }
                            }
                        }
                    }, new events_1.NewMessage({}));
                }
                catch (error) {
                    console.error(`❌ Failed to monitor channel ${channelId}:`, error);
                }
            }
        }
        catch (error) {
            console.error('❌ Failed to connect to Telegram:', error);
            this.isMonitoring = false;
            throw error;
        }
    }
    extractTokenAddresses(text) {
        return text.match(this.tokenPattern) || [];
    }
    detectChain(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('bsc') || lowerText.includes('binance'))
            return 'bsc';
        if (lowerText.includes('polygon') || lowerText.includes('matic'))
            return 'polygon';
        if (lowerText.includes('ethereum') || lowerText.includes('eth'))
            return 'ethereum';
        return 'unknown';
    }
    async stop() {
        if (this.client) {
            await this.client.disconnect();
        }
        this.isMonitoring = false;
    }
}
exports.TelegramMonitor = TelegramMonitor;
