import { Settings } from '../config/settings';
import { TokenMetadata } from '../sniping/types/interfaces';
import axios from 'axios';
import { ethers } from 'ethers';

export class TelegramMonitor {
    private apiUrl: string;
    private lastUpdateId: number = 0;
    private tokenPattern: RegExp = /0x[a-fA-F0-9]{40}/g; // Matches Ethereum-style addresses

    constructor() {
        if (!Settings.telegram.apiId || !Settings.telegram.apiHash) {
            throw new Error('Telegram API credentials not configured');
        }
        this.apiUrl = `https://api.telegram.org/bot${Settings.telegram.apiId}:${Settings.telegram.apiHash}`;
    }

    async startMonitoring(callback: (token: TokenMetadata) => Promise<void>) {
        console.log('🔄 Starting Telegram monitor...');
        
        while (true) {
            try {
                await this.pollMessages(callback);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
            } catch (error) {
                console.error('Error in Telegram monitoring:', error);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s on error
            }
        }
    }

    private async pollMessages(callback: (token: TokenMetadata) => Promise<void>) {
        const updates = await this.getUpdates();
        
        for (const update of updates) {
            if (update.message?.text) {
                const addresses = this.extractTokenAddresses(update.message.text);
                
                for (const address of addresses) {
                    if (ethers.isAddress(address)) {
                        const metadata: TokenMetadata = {
                            address: address,
                            chain: this.detectChain(update.message.text),
                            creationTime: Date.now(),
                            liquidityAmount: 0,
                            source: 'telegram',
                            channelId: update.message.chat.id.toString()
                        };

                        await callback(metadata);
                    }
                }
            }
            this.lastUpdateId = update.update_id + 1;
        }
    }

    private async getUpdates() {
        try {
            const response = await axios.get(`${this.apiUrl}/getUpdates`, {
                params: {
                    offset: this.lastUpdateId,
                    allowed_updates: ['message']
                }
            });
            return response.data.result || [];
        } catch (error) {
            console.error('Failed to get Telegram updates:', error);
            return [];
        }
    }

    private extractTokenAddresses(text: string): string[] {
        return text.match(this.tokenPattern) || [];
    }

    private detectChain(text: string): string {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('bsc') || lowerText.includes('binance')) return 'bsc';
        if (lowerText.includes('polygon') || lowerText.includes('matic')) return 'polygon';
        if (lowerText.includes('ethereum') || lowerText.includes('eth')) return 'ethereum';
        return 'unknown';
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.apiUrl}/getMe`);
            console.log('✅ Telegram monitor connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to Telegram:', error);
            return false;
        }
    }
}
