"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigurator = void 0;
class SystemConfigurator {
    async configure(network, contracts, settings) {
        const config = this.loadNetworkConfig(network);
        await this.setContractParameters(contracts, config);
        return this.validateConfiguration();
    }
}
exports.SystemConfigurator = SystemConfigurator;
