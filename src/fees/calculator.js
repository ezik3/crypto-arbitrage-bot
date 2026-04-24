"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeCalculator = void 0;
// Taker fee rates per exchange (as a fraction, e.g. 0.001 = 0.1%)
const EXCHANGE_TAKER_FEES = {
    binance: 0.001, // 0.10%
    bybit: 0.001, // 0.10%
    kraken: 0.0026, // 0.26%
    kucoin: 0.001, // 0.10%
    poloniex: 0.002, // 0.20%
    gateio: 0.002, // 0.20%
    uniswap_v2: 0.003, // 0.30%
    uniswap_v3: 0.001, // 0.05% or 0.30% depending on pool – default mid
    sushiswap: 0.003, // 0.30%
    pancakeswap: 0.0025 // 0.25%
};
// Withdrawal fees per asset per exchange (in asset units)
const WITHDRAWAL_FEES = {
    binance: { USDT: 1, ETH: 0.0005, BTC: 0.0004 },
    bybit: { USDT: 1, ETH: 0.0006, BTC: 0.0005 },
    kraken: { USDT: 2.5, ETH: 0.0015, BTC: 0.00015 },
    kucoin: { USDT: 1, ETH: 0.0009, BTC: 0.0005 },
    poloniex: { USDT: 25, ETH: 0.0014, BTC: 0.0002 },
    gateio: { USDT: 2, ETH: 0.001, BTC: 0.0004 }
};
class FeeCalculator {
    /**
     * Get the taker fee rate for an exchange.
     */
    static getTakerFee(exchangeName) {
        var _a;
        return (_a = EXCHANGE_TAKER_FEES[exchangeName.toLowerCase()]) !== null && _a !== void 0 ? _a : 0.002;
    }
    /**
     * Get the withdrawal fee for an asset on an exchange in USD.
     */
    static getWithdrawalFeeUsd(exchangeName, asset, assetPriceUsd) {
        var _a, _b;
        const ex = exchangeName.toLowerCase();
        const assetUpper = asset.toUpperCase().replace('USDT', 'USDT');
        const fee = (_b = (_a = WITHDRAWAL_FEES[ex]) === null || _a === void 0 ? void 0 : _a[assetUpper]) !== null && _b !== void 0 ? _b : 0;
        if (assetUpper === 'USDT' || assetUpper === 'USDC' || assetUpper === 'DAI') {
            return fee;
        }
        return fee * assetPriceUsd;
    }
    /**
     * Full fee breakdown for a cross-exchange arbitrage trade.
     * @param tradeAmountUsd - size of the trade in USD
     * @param buyExchange - exchange to buy on
     * @param sellExchange - exchange to sell on
     * @param asset - base asset symbol
     * @param assetPriceUsd - current price
     * @param gasUsd - estimated gas cost in USD
     * @param flashLoanFeeRate - flash loan fee rate (e.g. 0.0009 for Aave)
     */
    calculateTotalFees(params) {
        const { tradeAmountUsd, buyExchange, sellExchange, asset, assetPriceUsd, gasUsd = 0, flashLoanFeeRate = 0 } = params;
        const buyFee = tradeAmountUsd * FeeCalculator.getTakerFee(buyExchange);
        const sellFee = tradeAmountUsd * FeeCalculator.getTakerFee(sellExchange);
        const withdrawalFee = FeeCalculator.getWithdrawalFeeUsd(buyExchange, asset, assetPriceUsd);
        const flashLoan = tradeAmountUsd * flashLoanFeeRate;
        const total = buyFee + sellFee + withdrawalFee + gasUsd + flashLoan;
        return { buyFee, sellFee, withdrawalFee, gas: gasUsd, flashLoan, total };
    }
    /**
     * Minimum profit required (in %) to break even after fees.
     */
    minimumProfitPercent(tradeAmountUsd, buyExchange, sellExchange) {
        const buyFeeRate = FeeCalculator.getTakerFee(buyExchange);
        const sellFeeRate = FeeCalculator.getTakerFee(sellExchange);
        // Round-trip fee: buy + sell; multiply by 100 to get %
        return (buyFeeRate + sellFeeRate) * 100;
    }
}
exports.FeeCalculator = FeeCalculator;
