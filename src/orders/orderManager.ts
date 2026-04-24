
import { ethers } from 'ethers';
import { ExchangeManager } from '../exchanges/exchangeManager';

export interface OrderParams {
    exchange: string;
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price?: number;          // omit for market order
    orderType?: 'market' | 'limit';
}

export interface OrderResult {
    success: boolean;
    orderId?: string;
    filledAmount?: number;
    avgPrice?: number;
    fee?: number;
    error?: string;
}

export interface ArbitrageExecution {
    buyResult: OrderResult;
    sellResult: OrderResult;
    netProfit: number;
    success: boolean;
}

export class OrderManager {
    private executionQueue: Map<string, any> = new Map();
    private exchangeManager: ExchangeManager;

    constructor(exchangeManager?: ExchangeManager) {
        this.exchangeManager = exchangeManager ?? new ExchangeManager();
    }

    /**
     * Execute a single order on a CEX via CCXT.
     */
    async executeOrder(params: OrderParams): Promise<OrderResult> {
        try {
            const exchange = this.exchangeManager.getExchange(params.exchange);
            if (!exchange) {
                return { success: false, error: `Exchange ${params.exchange} not found or not initialized` };
            }

            const orderType = params.orderType ?? 'market';

            console.log(`📤 ${params.side.toUpperCase()} ${params.amount} ${params.symbol} on ${params.exchange} (${orderType})`);

            const order = await exchange.createOrder(
                params.symbol,
                orderType,
                params.side,
                params.amount,
                params.price
            );

            const filledAmount = order.filled ?? order.amount ?? params.amount;
            const avgPrice = order.average ?? order.price ?? params.price ?? 0;
            const fee = order.fee?.cost ?? 0;

            console.log(`✅ Order filled: ${filledAmount} @ ${avgPrice}, fee: ${fee}`);

            return {
                success: true,
                orderId: order.id,
                filledAmount,
                avgPrice,
                fee
            };
        } catch (error: any) {
            const msg = error?.message ?? String(error);
            console.error(`❌ Order failed on ${params.exchange}: ${msg}`);
            return { success: false, error: msg };
        }
    }

    /**
     * Execute a cross-exchange arbitrage: buy on one exchange, sell on another.
     */
    async executeArbitrage(params: {
        symbol: string;
        buyExchange: string;
        sellExchange: string;
        amount: number;
        buyPrice: number;
        sellPrice: number;
    }): Promise<ArbitrageExecution> {
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
        const totalFees = (buyResult.fee ?? 0) + (sellResult.fee ?? 0);
        const netProfit = grossProfit - totalFees;

        const success = buyResult.success && sellResult.success;

        if (success) {
            console.log(`✅ Arbitrage complete. Net profit: $${netProfit.toFixed(4)}`);
        } else {
            console.error('❌ Arbitrage partially failed – manual review required');
            if (!buyResult.success) console.error('  Buy leg failed:', buyResult.error);
            if (!sellResult.success) console.error('  Sell leg failed:', sellResult.error);
        }

        return { buyResult, sellResult, netProfit, success };
    }

    private trackOrderStatus(orderId: string) {
        return {
            phase: 'COMPLETE',
            progress: 100,
            orderId
        };
    }

    private measureExecutionQuality(order: OrderResult) {
        return {
            speed: 'FAST',
            slippage: 0,
            realizedProfit: 0
        };
    }
}