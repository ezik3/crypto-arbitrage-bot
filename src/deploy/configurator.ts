
export class SystemConfigurator {
    async configure(
        network: string,
        contracts: any,
        settings: any
    ) {
        const config = this.loadNetworkConfig(network);
        await this.setContractParameters(contracts, config);
        return this.validateConfiguration();
    }

    loadNetworkConfig(network: string): any { return {}; }
    async setContractParameters(contracts: any, config: any): Promise<void> { }
    validateConfiguration(): any { return {}; }
}
