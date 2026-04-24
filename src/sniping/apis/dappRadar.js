"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DappRadarAPI = void 0;
const axios_1 = __importStar(require("axios"));
const apiConfig_1 = require("../../config/apiConfig");
class DappRadarAPI {
    constructor(apiKey) {
        this.baseUrl = apiConfig_1.apiConfig.dappradar.baseURL;
        this.headers = {
            ...apiConfig_1.apiConfig.dappradar.headers,
            'x-api-key': apiKey || process.env.DAPPRADAR_API_KEY || ''
        };
    }
    async getTokenData(address) {
        var _a, _b, _c, _d;
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tokens/${address}`, { headers: this.headers });
            return {
                address,
                chain: 'ethereum',
                source: 'dappradar',
                name: response.data.name || 'Unknown',
                symbol: response.data.symbol || 'Unknown',
                creationTime: response.data.createdAt || Date.now(),
                liquidityAmount: ((_a = response.data.liquidity) === null || _a === void 0 ? void 0 : _a.usd) || 0,
                marketCap: ((_b = response.data.marketCap) === null || _b === void 0 ? void 0 : _b.usd) || 0,
                volume24h: ((_c = response.data.volume24h) === null || _c === void 0 ? void 0 : _c.usd) || 0,
                holders: response.data.holders || 0,
                liquidity: ((_d = response.data.liquidity) === null || _d === void 0 ? void 0 : _d.usd) || 0,
                securityScore: 70
            };
        }
        catch (error) {
            console.error('Error fetching token data:', error);
            throw error;
        }
    }
    async getTokenVolume(address) {
        var _a;
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tokens/${address}/volume`, { headers: this.headers });
            return ((_a = response.data.volume24h) === null || _a === void 0 ? void 0 : _a.usd) || 0;
        }
        catch (error) {
            console.error('Error fetching token volume:', error);
            return 0;
        }
    }
    async getNewTokens() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tokens/new`, {
                timeout: 5000,
                headers: this.headers
            });
            return this.formatTokenData(response.data);
        }
        catch (error) {
            console.log('⚠️ Failed to fetch new tokens, using cache');
            return [];
        }
    }
    formatTokenData(data) {
        if (!Array.isArray(data))
            return [];
        return data.map(token => {
            var _a, _b, _c, _d;
            return ({
                address: token.address,
                chain: 'ethereum',
                source: 'dappradar',
                name: token.name || 'Unknown',
                symbol: token.symbol || 'Unknown',
                creationTime: token.createdAt || Date.now(),
                liquidityAmount: ((_a = token.liquidity) === null || _a === void 0 ? void 0 : _a.usd) || 0,
                marketCap: ((_b = token.marketCap) === null || _b === void 0 ? void 0 : _b.usd) || 0,
                volume24h: ((_c = token.volume24h) === null || _c === void 0 ? void 0 : _c.usd) || 0,
                holders: token.holders || 0,
                liquidity: ((_d = token.liquidity) === null || _d === void 0 ? void 0 : _d.usd) || 0,
                securityScore: 70
            });
        });
    }
    async testConnection() {
        try {
            console.log('Testing with headers:', {
                ...this.headers,
                'x-api-key': 'REDACTED'
            });
            const response = await axios_1.default.get(`${this.baseUrl}/tokens/chains`, {
                timeout: 5000,
                headers: this.headers
            });
            if (response.data && response.data.success) {
                console.log('✅ DappRadar API connection successful');
                return true;
            }
            throw new Error('Invalid response format');
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError) {
                console.log('⚠️ DappRadar API connection failed:', error.message);
                if (error.response) {
                    console.log('Response data:', error.response.data);
                    console.log('Response status:', error.response.status);
                }
            }
            else {
                console.log('⚠️ DappRadar API connection failed:', 'Unknown error occurred');
            }
            return false;
        }
    }
}
exports.DappRadarAPI = DappRadarAPI;
