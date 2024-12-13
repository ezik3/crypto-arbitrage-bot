
export class AlertSystem {
    private readonly PROFIT_THRESHOLD = 2.0; // 2% minimum profit
    private readonly GAS_THRESHOLD = 100; // in gwei

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
}
