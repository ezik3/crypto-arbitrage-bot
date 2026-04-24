"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderManager = void 0;
const exchangeManager_1 = require("../exchanges/exchangeManager");
class OrderManager {
    constructor(exchangeManager) {
        this.executionQueue = new Map();
        this.exchangeManager = exchangeManager !== null && exchangeManager !== void 0 ? exchangeManager : new exchangeManager_1.ExchangeManager();
    }
    /**
     * Execute a single order on a CEX via CCXT.
     */
    async executeOrder(params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        try {
            const exchange = this.exchangeManager.getExchange(params.exchange);
            if (!exchange) {
                return { success: false, error: `Exchange ${params.exchange} not found or not initialized` };
            }
            const orderType = (_a = params.orderType) !== null && _a !== void 0 ? _a : 'market';
            console.log(`📤 ${params.side.toUpperCase()} ${params.amount} ${params.symbol} on ${params.exchange} (${orderType})`);
            const order = await exchange.createOrder(params.symbol, orderType, params.side, params.amount, params.price);
            const filledAmount = (_c = (_b = order.filled) !== null && _b !== void 0 ? _b : order.amount) !== null && _c !== void 0 ? _c : params.amount;
            const avgPrice = (_f = (_e = (_d = order.average) !== null && _d !== void 0 ? _d : order.price) !== null && _e !== void 0 ? _e : params.price) !== null && _f !== void 0 ? _f : 0;
            const fee = (_h = (_g = order.fee) === null || _g === void 0 ? void 0 : _g.cost) !== null && _h !== void 0 ? _h : 0;
            console.log(`✅ Order filled: ${filledAmount} @ ${avgPrice}, fee: ${fee}`);
            return {
                success: true,
                orderId: order.id,
                filledAmount,
                avgPrice,
                fee
            };
        }
        catch (error) {
            const msg = (_j = error === null || error === void 0 ? void 0 : error.message) !== null && _j !== void 0 ? _j : String(error);
            console.error(`❌ Order failed on ${params.exchange}: ${msg}`);
            return { success: false, error: msg };
        }
    }
    /**
     * Execute a cross-exchange arbitrage: buy on one exchange, sell on another.
     */
    async executeArbitrage(params) {
        var _a, _b;
        console.log(`\n⚡ Executing arbitrage: ${params.symbol}`);
        console.log(`   Buy  on ${params.buyExchange}  @ ${params.buyPrice}`);
        console.log(`   Sell on ${params.sellExchange} @ ${params.sellPrice}`);
        // Execute buy and sell concurrently
        const [buyResult, sellResult] = await Promise.all([
            this.executeOrder({
                exchange: params.buyExchange,
                symbol: params.symbol,
                side: 'buy',
                amount: params.amount,
                orderType: 'market'
            }),
            this.executeOrder({
                exchange: params.sellExchange,
                symbol: params.symbol,
                side: 'sell',
                amount: params.amount,
                orderType: 'market'
            })
        ]);
        const grossProfit = (params.sellPrice - params.buyPrice) * params.amount;
        const totalFees = ((_a = buyResult.fee) !== null && _a !== void 0 ? _a : 0) + ((_b = sellResult.fee) !== null && _b !== void 0 ? _b : 0);
        const netProfit = grossProfit - totalFees;
        const success = buyResult.success && sellResult.success;
        if (success) {
            console.log(`✅ Arbitrage complete. Net profit: $${netProfit.toFixed(4)}`);
        }
        else {
            console.error('❌ Arbitrage partially failed – manual review required');
            if (!buyResult.success)
                console.error('  Buy leg failed:', buyResult.error);
            if (!sellResult.success)
                console.error('  Sell leg failed:', sellResult.error);
        }
        return { buyResult, sellResult, netProfit, success };
    }
    trackOrderStatus(orderId) {
        return {
            phase: 'COMPLETE',
            progress: 100,
            orderId
        };
    }
    measureExecutionQuality(order) {
        return {
            speed: 'FAST',
            slippage: 0,
            realizedProfit: 0
        };
    }
}
exports.OrderManager = OrderManager;
