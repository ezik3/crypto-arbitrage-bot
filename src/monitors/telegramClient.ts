import { Settings } from '../config/settings';

class MTProtoStub {
    constructor(options: any) {}
    async connect() {}
    async call(method: string, params: any): Promise<any> { return { messages: [] }; }
}

export class TelegramClient {
    private api: MTProtoStub;

    constructor() {
        this.api = new MTProtoStub({
            api_id: Settings.telegram.apiId,
            api_hash: Settings.telegram.apiHash,
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
        } catch (error) {
            console.error('❌ Failed to connect to Telegram:', error);
            return false;
        }
    }

    async getChannelMessages(channelId: string) {
        try {
            const result = await this.api.call('channels.getMessages', {
                channel: channelId,
                limit: 100
            });
            return result.messages || [];
        } catch (error) {
            console.error(`Failed to get messages from channel ${channelId}:`, error);
            return [];
        }
    }
}
