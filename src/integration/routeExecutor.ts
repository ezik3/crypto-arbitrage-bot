
import { DexRouter } from '../dex/router';
import { PathFinder } from '../dex/pathFinder';
import { RouteOptimizer } from '../dex/routeOptimizer';

export class RouteExecutor {
    private dexRouter: DexRouter;
    private pathFinder: PathFinder;
    private routeOptimizer: RouteOptimizer;

    constructor() {
        this.dexRouter = new DexRouter();
        this.pathFinder = new PathFinder();
        this.routeOptimizer = new RouteOptimizer();
    }

    async executeOptimalRoute(
        tokenIn: string,
        tokenOut: string,
        amount: string
    ) {
        const bestRoute = await this.findAndOptimizeRoute(tokenIn, tokenOut, amount);
        return this.executeRoute(bestRoute);
    }
}
