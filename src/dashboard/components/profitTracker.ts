
export class ProfitTracker {
    private profitHistory: Array<{
        timestamp: number;
        profit: number;
        token: string;
    }> = [];

    async trackProfit(profit: number, token: string) {
        this.profitHistory.push({
            timestamp: Date.now(),
            profit,
            token
        });
        
        return this.calculateMetrics();
    }
}
