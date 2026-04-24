"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuillAIAPI = void 0;
const axios_1 = __importDefault(require("axios"));
class QuillAIAPI {
    constructor(apiKey) {
        this.baseUrl = 'https://api.quillai.network';
        this._apiKey = apiKey;
    }
    get apiKey() {
        return this._apiKey;
    }
    async analyzeContract(address) {
        const response = await axios_1.default.get(`${this.baseUrl}/check/${address}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        const data = response.data;
        return {
            isHoneypot: data.isHoneypot || false,
            rugPullRisk: this.calculateRugPullRisk(data),
            liquidityLocked: data.liquidityLocked || false,
            contractVerified: data.contractVerified || false,
            ownershipRenounced: data.ownershipRenounced || false,
            score: data.securityScore || 0
        };
    }
    async getTokenMetrics(address) {
        const response = await axios_1.default.get(`${this.baseUrl}/metrics/${address}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return {
            buyTax: response.data.buyTax || 0,
            sellTax: response.data.sellTax || 0,
            liquidityLock: response.data.liquidityLocked || false,
            riskLevel: response.data.riskLevel || 'HIGH'
        };
    }
    calculateRugPullRisk(data) {
        const score = data.securityScore || 0;
        if (score >= 80)
            return 'LOW';
        if (score >= 50)
            return 'MEDIUM';
        return 'HIGH';
    }
    async monitorContract(address) {
        await axios_1.default.post(`${this.baseUrl}/monitor`, { address }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
    }
    async getAlerts(address) {
        const response = await axios_1.default.get(`${this.baseUrl}/alerts/${address}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return response.data.alerts || [];
    }
}
exports.QuillAIAPI = QuillAIAPI;
