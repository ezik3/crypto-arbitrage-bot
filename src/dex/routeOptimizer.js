"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteOptimizer = void 0;
class RouteOptimizer {
    async optimizeRoutes(routes, amount) {
        const optimizedRoutes = routes.map(route => ({
            path: route,
            expectedReturn: this.calculateExpectedReturn(route, amount),
            gasEstimate: this.estimateGasCost(route)
        }));
        return optimizedRoutes.sort((a, b) => b.expectedReturn - a.expectedReturn);
    }
}
exports.RouteOptimizer = RouteOptimizer;
