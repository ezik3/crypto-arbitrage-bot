"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractAnalyzer = void 0;
const ethers_1 = require("ethers");
const quillai_1 = require("./apis/quillai");
const axios_1 = __importDefault(require("axios"));
class ContractAnalyzer {
    constructor(rpcUrl, quillaiApiKey) {
        this.provider = new ethers_1.providers.JsonRpcProvider(rpcUrl);
        this.quillai = new quillai_1.QuillAIAPI(quillaiApiKey);
    }
    async analyzeContract(address) {
        const [honeypotCheck, rugPullRisk, liquidityLock] = await Promise.all([
            this.checkHoneypot(address),
            this.checkRugPullRisk(address),
            this.checkLiquidityLock(address)
        ]);
        return {
            isHoneypot: honeypotCheck,
            rugPullRisk: rugPullRisk,
            liquidityLocked: liquidityLock,
            contractVerified: await this.isContractVerified(address),
            ownershipRenounced: await this.isOwnershipRenounced(address),
            score: this.calculateSecurityScore({
                honeypot: honeypotCheck,
                rugPull: rugPullRisk,
                liquidity: liquidityLock
            })
        };
    }
    async checkHoneypot(address) {
        const response = await axios_1.default.get(`https://api.quillai.network/check/${address}`, {
            headers: { 'Authorization': `Bearer ${this.quillai.apiKey}` }
        });
        return response.data.isHoneypot;
    }
    async checkRugPullRisk(address) {
        try {
            const contract = new ethers_1.Contract(address, ['function owner() view returns (address)'], this.provider);
            const owner = await contract.owner();
            if (owner === '0x0000000000000000000000000000000000000000') {
                return 'LOW';
            }
            return 'MEDIUM';
        }
        catch (_a) {
            return 'HIGH';
        }
    }
    async checkLiquidityLock(address) {
        try {
            const response = await axios_1.default.get(`https://api.quillai.network/liquidity/${address}`, {
                headers: { 'Authorization': `Bearer ${this.quillai.apiKey}` }
            });
            return response.data.liquidityLocked;
        }
        catch (_a) {
            return false;
        }
    }
    async isContractVerified(address) {
        try {
            const code = await this.provider.getCode(address);
            return code !== '0x';
        }
        catch (_a) {
            return false;
        }
    }
    async isOwnershipRenounced(address) {
        try {
            const contract = new ethers_1.Contract(address, ['function owner() view returns (address)'], this.provider);
            const owner = await contract.owner();
            return owner === '0x0000000000000000000000000000000000000000';
        }
        catch (_a) {
            return false;
        }
    }
    calculateSecurityScore(checks) {
        let score = 100;
        if (checks.honeypot)
            score -= 50;
        if (checks.rugPull === 'HIGH')
            score -= 30;
        if (checks.rugPull === 'MEDIUM')
            score -= 15;
        if (!checks.liquidity)
            score -= 20;
        return Math.max(0, score);
    }
}
exports.ContractAnalyzer = ContractAnalyzer;
