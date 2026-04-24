"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteExecutor = void 0;
const router_1 = require("../dex/router");
const pathFinder_1 = require("../dex/pathFinder");
const routeOptimizer_1 = require("../dex/routeOptimizer");
class RouteExecutor {
    constructor() {
        this.dexRouter = new router_1.DexRouter();
        this.pathFinder = new pathFinder_1.PathFinder();
        this.routeOptimizer = new routeOptimizer_1.RouteOptimizer();
    }
    async executeOptimalRoute(tokenIn, tokenOut, amount) {
        const bestRoute = await this.findAndOptimizeRoute(tokenIn, tokenOut, amount);
        return this.executeRoute(bestRoute);
    }
}
exports.RouteExecutor = RouteExecutor;
