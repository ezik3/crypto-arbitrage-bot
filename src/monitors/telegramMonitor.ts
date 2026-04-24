import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { TokenMetadata } from '../sniping/types/interfaces';
import { ethers } from 'ethers';
import { Settings } from '../config/settings';
// @ts-ignore
import input from 'input';
import { NewMessage } from 'telegram/events';
import { Api } from 'telegram';

export class TelegramMonitor {
    private client: TelegramClient;
    private tokenPattern: RegExp = /0x[a-fA-F0-9]{40}/g;
    private isMonitoring: boolean = false;
    private stringSession: StringSession;

    constructor() {
        console.log('📱 Initializing Telegram Monitor...');
        
        const apiId = parseInt(Settings.telegram.apiId || '0');
        const apiHash = Settings.telegram.apiHash;
        
        if (!apiId || !apiHash) {
            console.error('❌ Missing Telegram credentials:', {
                apiId: !!apiId,
                apiHash: !!apiHash
            });
            throw new Error('Telegram API credentials not configured');
        }

        console.log('✅ Telegram credentials found');
        console.log('📋 Channels to monitor:', Settings.telegram.channels);

        this.stringSession = new StringSession('');
        this.client = new TelegramClient(this.stringSession, apiId, apiHash, {
            connectionRetries: 5,
            useWSS: true,
            baseLogger: console as any
        });
    }

    async startMonitoring(callback: (token: TokenMetadata) => Promise<void>) {
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
                const phone = await input.text('Enter your phone number: ');
                const code = await this.client.sendCode({
                    apiId: parseInt(Settings.telegram.apiId || '0'),
                    apiHash: Settings.telegram.apiHash || '',
                }, phone);
                
                const userCode = await input.text('Enter the code you received: ');
                await (this.client as any).signIn({
                    phoneNumber: phone,
                    phoneCodeHash: code.phoneCodeHash,
                    phoneCode: userCode,
                });
                console.log('✅ Authentication successful');
            }

            this.isMonitoring = true;
            console.log('🎯 Starting channel monitoring...');

            for (const channelId of Settings.telegram.channels) {
                try {
                    console.log(`🔍 Attempting to monitor channel: ${channelId}`);
                    const channel = await this.client.getEntity(channelId);
                    console.log(`✅ Successfully connected to channel: ${channelId}`);

                    this.client.addEventHandler(async (event: any) => {
                        if (event.message?.message) {
                            const addresses = this.extractTokenAddresses(event.message.message);
                            for (const address of addresses) {
                                if (ethers.utils.isAddress(address)) {
                                    await callback({
                                        address,
                                        chain: this.detectChain(event.message.message),
                                        creationTime: Date.now(),
                                        liquidityAmount: 0,
                                        source: 'telegram'
                                    });
                                }
                            }
                        }
                    }, new NewMessage({}));
                } catch (error) {
                    console.error(`❌ Failed to monitor channel ${channelId}:`, error);
                }
            }
        } catch (error) {
            console.error('❌ Failed to connect to Telegram:', error);
            this.isMonitoring = false;
            throw error;
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

    async stop() {
        if (this.client) {
            await this.client.disconnect();
        }
        this.isMonitoring = false;
    }
}
