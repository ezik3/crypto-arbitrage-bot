"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentVerifier = void 0;
class DeploymentVerifier {
    async verifyDeployment(deployedContracts) {
        const checks = await Promise.all([
            this.verifyContractCode(deployedContracts),
            this.checkContractBalances(),
            this.validateConnections()
        ]);
        return this.generateDeploymentReport(checks);
    }
}
exports.DeploymentVerifier = DeploymentVerifier;
