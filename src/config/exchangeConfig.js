"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeConfig = void 0;
exports.exchangeConfig = {
    gateio: {
        defaultPairs: [
            'BTC/USDT',
            'ETH/USDT',
            'BNB/USDT',
            'SOL/USDT',
            'XRP/USDT'
        ],
        options: {
            enforceMarketValidation: false,
            retryOnEmpty: true,
            timeout: 30000
        }
    }
};
