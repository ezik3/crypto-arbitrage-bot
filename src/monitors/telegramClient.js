"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramClient = void 0;
const telegram_mtproto_1 = require("telegram-mtproto");
const settings_1 = require("../config/settings");
class TelegramClient {
    constructor() {
        this.api = new telegram_mtproto_1.MTProto({
            api_id: settings_1.Settings.telegram.apiId,
            api_hash: settings_1.Settings.telegram.apiHash,
            storageOptions: {
                path: './.telegram-session'
            }
        });
    }
    async connect() {
        try {
            await this.api.connect();
            console.log('✅ Connected to Telegram MTProto');
            return true;
        }
        catch (error) {
            console.error('❌ Failed to connect to Telegram:', error);
            return false;
        }
    }
    async getChannelMessages(channelId) {
        try {
            const result = await this.api.call('channels.getMessages', {
                channel: channelId,
                limit: 100
            });
            return result.messages || [];
        }
        catch (error) {
            console.error(`Failed to get messages from channel ${channelId}:`, error);
            return [];
        }
    }
}
exports.TelegramClient = TelegramClient;
