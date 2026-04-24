
/// <reference types="jest" />
import { ArbitrageController } from '../../arbitrageController';

describe('Arbitrage Tests', () => {
    it('should calculate correct profit margins', async () => {
        const controller = new ArbitrageController('0x0000000000000000000000000000000000000000000000000000000000000001');
        const profit = await controller.calculateProfit();
        expect(profit).toBeGreaterThanOrEqual(0);
    });
});
