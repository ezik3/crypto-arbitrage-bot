"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const arbitrageController_1 = require("../../arbitrageController");
describe('Arbitrage Tests', () => {
    it('should calculate correct profit margins', async () => {
        const controller = new arbitrageController_1.ArbitrageController();
        const profit = await controller.calculateProfit( /* test data */);
        (0, chai_1.expect)(profit).to.be.above(0);
    });
});
