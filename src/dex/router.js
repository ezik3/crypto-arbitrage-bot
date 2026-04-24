"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexRouter = void 0;
const exchanges_1 = require("../exchanges");
class DexRouter {
    constructor() {
        this.exchanges = new exchanges_1.ExchangeManager();
    }
    async findBestRoute(tokenIn, tokenOut, amount, maxHops = 3) {
        const routes = await this.calculateAllRoutes(tokenIn, tokenOut, maxHops);
        return this.optimizeRoutes(routes, amount);
    }
}
exports.DexRouter = DexRouter;
