"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deployer = void 0;
class Deployer {
    async deploySystem(config) {
        const contracts = await this.deployContracts();
        const connections = await this.setupConnections(contracts);
        return {
            contracts,
            connections,
            status: await this.verifyDeployment()
        };
    }
}
exports.Deployer = Deployer;
