"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityBridge = void 0;
class LiquidityBridge {
    async bridgeLiquidity(amount, token) {
        const bridgeParams = this.prepareBridgeParams();
        return {
            execution: await this.executeBridge(bridgeParams),
            confirmation: this.waitForConfirmation(),
            status: this.trackBridgeStatus()
        };
    }
}
exports.LiquidityBridge = LiquidityBridge;
