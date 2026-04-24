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
exports.ExchangeManager = void 0;
const gateio_1 = require("./gateio");
const ccxt = __importStar(require("ccxt"));
class ExchangeManager {
    constructor() {
        this.gateio = null;
        this.exchanges = new Map();
        // Initialize Gate.io
        if (process.env.GATEIO_API_KEY && process.env.GATEIO_API_SECRET) {
            const gateioExchange = new gateio_1.GateIoExchange(process.env.GATEIO_API_KEY, process.env.GATEIO_API_SECRET);
            this.exchanges.set('gateio', gateioExchange);
            this.gateio = gateioExchange;
        }
        // Initialize all CCXT exchanges
        const exchangeConfigs = [
            { name: 'binance', className: ccxt.binance },
            { name: 'bybit', className: ccxt.bybit },
            { name: 'kucoin', className: ccxt.kucoin },
            { name: 'kraken', className: ccxt.kraken },
            { name: 'poloniex', className: ccxt.poloniex }
        ];
        for (const config of exchangeConfigs) {
            if (process.env[`${config.name.toUpperCase()}_API_KEY`]) {
                const exchangeConfig = {
                    apiKey: process.env[`${config.name.toUpperCase()}_API_KEY`],
                    secret: process.env[`${config.name.toUpperCase()}_API_SECRET`]
                };
                // Add passphrase for KuCoin
                if (config.name === 'kucoin') {
                    exchangeConfig.password = process.env.KUCOIN_API_PASSPHRASE;
                }
                this.exchanges.set(config.name, new config.className(exchangeConfig));
            }
        }
    }
    async initializeExchanges() {
        for (const [name, exchange] of this.exchanges) {
            try {
                if (exchange.testConnection) {
                    await exchange.testConnection();
                }
                console.log(`✅ ${name.toUpperCase()} exchange initialized successfully`);
            }
            catch (error) {
                console.error(`❌ Failed to initialize ${name.toUpperCase()} exchange:`, error);
            }
        }
        // Ensure Gate.io is properly initialized
        if (this.gateio && !this.exchanges.has('gateio')) {
            try {
                await this.gateio.testConnection();
                this.exchanges.set('gateio', this.gateio);
                console.log('✅ GATEIO exchange initialized successfully');
            }
            catch (error) {
                console.error('❌ Failed to initialize GATEIO exchange:', error);
            }
        }
    }
    getExchange(name) {
        return this.exchanges.get(name.toLowerCase());
    }
    getAllExchanges() {
        return this.exchanges;
    }
    async testConnections() {
        for (const [name, exchange] of this.exchanges) {
            console.log(`Testing ${name} connection...`);
            if (exchange.testConnection) {
                await exchange.testConnection();
            }
        }
    }
    async fetchPrice(exchangeName, symbol) {
        try {
            const exchange = this.exchanges.get(exchangeName.toLowerCase());
            if (!exchange) {
                throw new Error(`Exchange ${exchangeName} not found`);
            }
            const ticker = await exchange.fetchTicker(symbol);
            return ticker.last;
        }
        catch (error) {
            console.error(`Error fetching price from ${exchangeName} for ${symbol}:`, error);
            throw error;
        }
    }
}
exports.ExchangeManager = ExchangeManager;
