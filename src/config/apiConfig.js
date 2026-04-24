"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiConfig = void 0;
exports.apiConfig = {
    dappradar: {
        baseURL: 'https://apis.dappradar.com/v2',
        endpoints: {
            tokens: '/tokens',
            newTokens: '/tokens/new'
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }
};
