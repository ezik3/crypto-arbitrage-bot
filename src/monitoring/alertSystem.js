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
exports.AlertSystem = void 0;
class AlertSystem {
    constructor() {
        this.PROFIT_THRESHOLD = 2.0; // 2% minimum profit
        this.GAS_THRESHOLD = 100; // in gwei
    }
    async monitorAndAlert(profitability, gasPrice, healthStatus) {
        if (this.shouldTriggerAlert(profitability, gasPrice, healthStatus)) {
            await this.sendAlert({
                profit: profitability,
                gas: gasPrice,
                health: healthStatus
            });
        }
    }
    shouldTriggerAlert(profitability, gasPrice, healthStatus) {
        return (profitability > this.PROFIT_THRESHOLD ||
            gasPrice > this.GAS_THRESHOLD ||
            (healthStatus && !healthStatus.healthy));
    }
    async sendAlert(payload) {
        var _a, _b;
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const message = [
            `🚨 Arbitrage Alert`,
            `Profit: ${payload.profit.toFixed(2)}%`,
            `Gas: ${payload.gas} gwei`,
            `Health: ${(_b = (_a = payload.health) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 'unknown'}`
        ].join('\n');
        console.log('📣 ALERT:', message);
        if (telegramToken && chatId) {
            try {
                const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
                const { default: axios } = await Promise.resolve().then(() => __importStar(require('axios')));
                await axios.post(url, { chat_id: chatId, text: message });
            }
            catch (err) {
                console.error('Failed to send Telegram alert:', err);
            }
        }
    }
}
exports.AlertSystem = AlertSystem;
