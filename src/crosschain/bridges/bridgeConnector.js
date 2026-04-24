"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeConnector = void 0;
class BridgeConnector {
    async connectBridge(sourceChain, targetChain) {
        const bridgeContract = await this.getBridgeContract();
        return {
            connection: await this.establishConnection(bridgeContract),
            gasEstimates: this.calculateCrossChainGas(),
            optimalPath: this.findOptimalBridgePath()
        };
    }
}
exports.BridgeConnector = BridgeConnector;
