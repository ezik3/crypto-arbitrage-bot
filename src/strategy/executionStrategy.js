"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionStrategy = void 0;
class ExecutionStrategy {
    async executeWithProtection(route, gasPrice, minProfit) {
        const bundle = this.prepareTransactionBundle(route);
        const simulation = await this.simulateExecution(bundle);
        if (this.isExecutionSafe(simulation, minProfit)) {
            return this.flashbots.sendBundle(bundle);
        }
        return null;
    }
}
exports.ExecutionStrategy = ExecutionStrategy;
