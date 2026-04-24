"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthChecker = void 0;
class HealthChecker {
    async checkSystemHealth() {
        const checks = {
            network: await this.checkNetworkStatus(),
            contracts: await this.verifyContracts(),
            liquidity: await this.checkLiquidityLevels(),
            gas: await this.monitorGasPrices()
        };
        return this.generateHealthReport(checks);
    }
}
exports.HealthChecker = HealthChecker;
