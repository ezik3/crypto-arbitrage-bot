
export class AlertSystem {
    private readonly PROFIT_THRESHOLD = 2.0; // 2% minimum profit
    private readonly GAS_THRESHOLD = 100;    // in gwei

    async monitorAndAlert(
        profitability: number,
        gasPrice: number,
        healthStatus: any
    ) {
        if (this.shouldTriggerAlert(profitability, gasPrice, healthStatus)) {
            await this.sendAlert({
                profit: profitability,
                gas: gasPrice,
                health: healthStatus
            });
        }
    }

    private shouldTriggerAlert(profitability: number, gasPrice: number, healthStatus: any): boolean {
        return (
            profitability > this.PROFIT_THRESHOLD ||
            gasPrice > this.GAS_THRESHOLD ||
            (healthStatus && !healthStatus.healthy)
        );
    }

    private async sendAlert(payload: { profit: number; gas: number; health: any }): Promise<void> {
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        const message = [
            `🚨 Arbitrage Alert`,
            `Profit: ${payload.profit.toFixed(2)}%`,
            `Gas: ${payload.gas} gwei`,
            `Health: ${payload.health?.status ?? 'unknown'}`
        ].join('\n');

        console.log('📣 ALERT:', message);

        if (telegramToken && chatId) {
            try {
                const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
                const { default: axios } = await import('axios');
                await axios.post(url, { chat_id: chatId, text: message });
            } catch (err) {
                console.error('Failed to send Telegram alert:', err);
            }
        }
    }
}
