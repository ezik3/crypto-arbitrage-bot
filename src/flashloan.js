"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashLoanManager = void 0;
const ethers_1 = require("ethers");
const exchangeManager_1 = require("./exchanges/exchangeManager");
// Aave V2 lending pool ABI (minimal)
const AAVE_V2_LENDING_POOL_ABI = [
    'function flashLoan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] calldata modes, address onBehalfOf, bytes calldata params, uint16 referralCode) external'
];
const PROVIDER_URL = process.env.ETH_RPC_URL || '';
const AAVE_LENDING_POOL_ADDRESS = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'; // Aave V2 mainnet
class FlashLoanManager {
    constructor(privateKey) {
        this.contractAddress = AAVE_LENDING_POOL_ADDRESS;
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(PROVIDER_URL);
        this.wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        this.exchangeManager = new exchangeManager_1.ExchangeManager();
        this.lendingPool = new ethers_1.ethers.Contract(AAVE_LENDING_POOL_ADDRESS, AAVE_V2_LENDING_POOL_ABI, this.wallet);
    }
    async executeFlashLoan(tokenAddress, amount) {
        const gasPrice = await this.provider.getGasPrice();
        const estimatedGas = ethers_1.ethers.BigNumber.from('500000');
        const maxGasCost = gasPrice.mul(estimatedGas);
        if (!(await this.isWithinRiskTolerance(maxGasCost))) {
            throw new Error('Gas cost exceeds risk tolerance');
        }
        // Execute Aave V2 flash loan
        const tx = await this.lendingPool.flashLoan(this.wallet.address, // receiver (this contract/wallet)
        [tokenAddress], [amount], [0], // 0 = no debt, must repay in same tx
        this.wallet.address, '0x', 0);
        return tx.wait();
    }
    async isWithinRiskTolerance(gasCost) {
        const balance = await this.wallet.getBalance();
        const maxRisk = balance.mul(20).div(100); // 20% risk tolerance
        return gasCost.lte(maxRisk);
    }
    async checkArbitrageOpportunity(tokenAddress, amount, exchanges) {
        const prices = await Promise.all(exchanges.map(exchange => this.exchangeManager.fetchPrice(exchange, tokenAddress).catch(() => 0)));
        const validPrices = prices.filter(p => p > 0);
        if (validPrices.length < 2)
            return { profitable: false, expectedProfit: 0 };
        const maxPrice = Math.max(...validPrices);
        const minPrice = Math.min(...validPrices);
        // Flash loan fee: 0.09% on Aave V2
        const amountNum = parseFloat(amount);
        const flashLoanFee = amountNum * 0.0009;
        const potentialProfit = (maxPrice - minPrice) * amountNum - flashLoanFee;
        return {
            profitable: potentialProfit > 0,
            expectedProfit: potentialProfit
        };
    }
    async executeArbitrage(tokenAddress, amount, sourceExchange, targetExchange) {
        console.log(`⚡ Executing flash loan arbitrage: ${tokenAddress} amount=${amount} ${sourceExchange} -> ${targetExchange}`);
        return this.executeFlashLoan(tokenAddress, amount);
    }
}
exports.FlashLoanManager = FlashLoanManager;
