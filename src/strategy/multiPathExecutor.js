"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiPathExecutor = void 0;
class MultiPathExecutor {
    async splitAndExecute(route, amount, maxSplits = 3) {
        const optimalSplits = this.calculateOptimalSplits(amount, maxSplits);
        const executions = optimalSplits.map(split => this.executePathWithAmount(route, split));
        return Promise.all(executions);
    }
}
exports.MultiPathExecutor = MultiPathExecutor;
