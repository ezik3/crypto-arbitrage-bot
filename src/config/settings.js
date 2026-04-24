"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.Settings = {
    telegram: {
        apiId: process.env.TELEGRAM_API_ID,
        apiHash: process.env.TELEGRAM_API_HASH,
        channels: (process.env.TELEGRAM_CHANNELS || '').split(','),
    },
    profitStrategy: {
        conservative: {
            initialWithdrawal: 2.0, // Take initial investment at 2x
            profitLevels: [
                { multiplier: 3.0, percentage: 20 },
                { multiplier: 5.0, percentage: 30 },
                { multiplier: 10.0, percentage: 40 },
                { multiplier: 20.0, percentage: 50 }
            ]
        },
        aggressive: {
            initialWithdrawal: 4.0,
            profitLevels: [
                { multiplier: 5.0, percentage: 10 },
                { multiplier: 10.0, percentage: 20 },
                { multiplier: 20.0, percentage: 30 },
                { multiplier: 50.0, percentage: 40 }
            ]
        }
    },
    chains: {
        bsc: {
            rpc: 'https://bsc-dataseed.binance.org/',
            factoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap V2
            routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            gasLimit: 300000,
            maxGasPrice: 5 // in Gwei
        },
        polygon: {
            rpc: 'https://polygon-rpc.com',
            factoryAddress: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32', // QuickSwap
            routerAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
            gasLimit: 300000,
            maxGasPrice: 30
        }
    },
    trading: {
        minLiquidity: 10000, // Minimum liquidity in USD
        maxBuyTax: 10, // Maximum buy tax percentage
        maxSellTax: 10, // Maximum sell tax percentage
        minHolders: 50, // Minimum number of holders
        minSecurityScore: 70 // Minimum security score out of 100
    },
    dexscreener: {
        requestInterval: 1000, // 1 second between requests
        monitorInterval: 10000, // Check for new pairs every 10 seconds
    },
};
