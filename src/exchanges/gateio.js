"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateIoExchange = void 0;
const gate_api_1 = require("gate-api");
const config_1 = require("../config");
class GateIoExchange {
    constructor(apiKey, apiSecret) {
        const client = new gate_api_1.ApiClient();
        client.setApiKeySecret(apiKey, apiSecret);
        this.client = new gate_api_1.SpotApi(client);
        this.pairs = config_1.config.exchangePairs.gateio.pairs;
    }
    async fetchTradingPairs() {
        try {
            const response = await this.client.listCurrencyPairs();
            let availablePairs = response.body;
            if (!availablePairs || availablePairs.length === 0) {
                console.log('⚠️ No pairs returned from Gate.io API, using configured pairs');
                return this.pairs;
            }
            const validPairs = this.pairs.filter(pair => availablePairs.some((ap) => ap.id === pair.replace('/', '_')));
            if (validPairs.length === 0) {
                console.log('⚠️ No valid pairs found, using configured pairs');
                return this.pairs;
            }
            return validPairs;
        }
        catch (error) {
            console.error('Error fetching Gate.io pairs:', error);
            return this.pairs;
        }
    }
    async fetchTicker(symbol) {
        var _a;
        try {
            const formattedSymbol = symbol.replace('/', '_');
            const response = await this.client.listTickers({
                currencyPair: formattedSymbol,
                __stringValue__: ''
            });
            if (!((_a = response.body) === null || _a === void 0 ? void 0 : _a[0])) {
                throw new Error('No ticker data received');
            }
            return {
                symbol,
                last: parseFloat(response.body[0].last)
            };
        }
        catch (error) {
            console.error(`Error fetching price from Gate.io for ${symbol}:`, error);
            throw error;
        }
    }
    async fetchBalance(params) {
        var _a;
        try {
            const currency = (params === null || params === void 0 ? void 0 : params.currency) ? params.currency.toUpperCase() : 'USDT';
            const response = await this.client.listSpotAccounts({
                currency,
                __stringValue__: ''
            });
            if (!((_a = response.body) === null || _a === void 0 ? void 0 : _a[0])) {
                return { free: 0, used: 0, total: 0 };
            }
            const balance = response.body[0];
            return {
                free: parseFloat(balance.available),
                used: parseFloat(balance.locked),
                total: parseFloat(balance.available) + parseFloat(balance.locked)
            };
        }
        catch (error) {
            console.error('Error fetching balance from Gate.io:', error);
            throw error;
        }
    }
    async createOrder(symbol, type, side, amount, price) {
        var _a;
        try {
            const formattedSymbol = symbol.replace('/', '_');
            const response = await this.client.createOrder({
                currencyPair: formattedSymbol,
                side: side.toLowerCase(),
                amount: amount.toString(),
                price: (_a = price === null || price === void 0 ? void 0 : price.toString()) !== null && _a !== void 0 ? _a : '0',
                type: type.toLowerCase(),
                __stringValue__: ''
            });
            return response.body;
        }
        catch (error) {
            console.error('Error creating order on Gate.io:', error);
            throw error;
        }
    }
    async testConnection() {
        try {
            await this.client.listCurrencies();
            console.log('Gate.io API connection successful!');
            return true;
        }
        catch (error) {
            console.error('Gate.io API connection failed:', error);
            return false;
        }
    }
}
exports.GateIoExchange = GateIoExchange;
// Update pair format for Gate.io
const formatGateIoPair = (pair) => {
    return pair.replace('/', '_').toUpperCase();
};
// Update the currency pair format
const formatPair = (pair) => pair.replace('/', '_');
