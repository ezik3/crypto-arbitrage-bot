
import { expect } from 'chai';
import { ArbitrageController } from '../../arbitrageController';

describe('Arbitrage Tests', () => {
    it('should calculate correct profit margins', async () => {
        const controller = new ArbitrageController();
        const profit = await controller.calculateProfit(/* test data */);
        expect(profit).to.be.above(0);
    });
});
