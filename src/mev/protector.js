"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MevProtector = void 0;
const flashbots_1 = require("../flashbots/flashbots");
class MevProtector {
    constructor(provider) {
        this.flashbots = new flashbots_1.FlashbotsManager(provider);
    }
    async initialize(wallet) {
        await this.flashbots.initialize(wallet);
    }
    async protectTransaction(transaction, signer) {
        return this.flashbots.sendBundle([{ transaction, signer }]);
    }
}
exports.MevProtector = MevProtector;
