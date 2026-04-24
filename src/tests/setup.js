"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSetup = void 0;
const ethereum_waffle_1 = require("ethereum-waffle");
class TestSetup {
    static async initialize() {
        const provider = new ethereum_waffle_1.MockProvider();
        const [wallet] = provider.getWallets();
        return {
            provider,
            wallet,
            mockContracts: await this.deployMockContracts(wallet)
        };
    }
}
exports.TestSetup = TestSetup;
