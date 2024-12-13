
import { FlashLoanManager } from './flashloan';
import { TriangularArbitrage } from './triangular';

export class ArbitrageController {
    private flashLoanManager: FlashLoanManager;
    private triangularArbitrage: TriangularArbitrage;
    private isRunning: boolean = false;

    constructor(privateKey: string) {
        this.flashLoanManager = new FlashLoanManager(privateKey);
        this.triangularArbitrage = new TriangularArbitrage();
    }

    async start() {
        this.isRunning = true;
        while (this.isRunning) {
            try {
                // Check triangular opportunities
                const triangularOpp = await this.triangularArbitrage.findOpportunity();
                
                // Check flash loan opportunities
                const flashLoanOpp = await this.flashLoanManager.checkArbitrageOpportunity(
                    "TOKEN_ADDRESS",
                    "1000000000000000000" // 1 ETH
                );

                if (triangularOpp.profitable) {
                    await this.executeTriangularArbitrage(triangularOpp);
                }

                if (flashLoanOpp.profitable) {
                    await this.executeFlashLoanArbitrage(flashLoanOpp);
                }

                // Add delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error in arbitrage loop:', error);
            }
        }
    }
}
