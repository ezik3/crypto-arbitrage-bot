/// <reference types="jest" />

import { FeeCalculator } from '../fees/calculator';
import { ProfitManager } from '../profit/profitManager';
import { TriangularArbitrage } from '../triangular';
import { ExchangeManager } from '../exchanges/exchangeManager';

describe('FeeCalculator', () => {
    let calc: FeeCalculator;

    beforeEach(() => {
        calc = new FeeCalculator();
    });

    test('calculates gas cost correctly', () => {
        const result = calc.calculateTotalFees(50e-9, 300000, 0, []);
        expect(result.breakdown.gas).toBeCloseTo(0.015);
        expect(result.total).toBeCloseTo(0.015);
    });

    test('includes flash loan fee in total', () => {
        const result = calc.calculateTotalFees(50e-9, 300000, 0.09, [0.003, 0.003]);
        expect(result.breakdown.flashLoan).toBe(0.09);
        expect(result.breakdown.dex).toBeCloseTo(0.006);
        expect(result.total).toBeCloseTo(0.015 + 0.09 + 0.006);
    });

    test('handles zero fees gracefully', () => {
        const result = calc.calculateTotalFees(0, 0, 0, []);
        expect(result.total).toBe(0);
    });
});

describe('ProfitManager – fee-aware decision making', () => {
    let pm: ProfitManager;

    beforeEach(() => {
        pm = new ProfitManager();
    });

    test('marks trade profitable when gross profit well exceeds fees', async () => {
        const result = await pm.analyzeProfitability({
            type: 'cross',
            pair: 'BTC/USDT',
            profit: 2.0,       // 2% gross – well above fee overhead
            volume: 25,
            buyExchange: 'binance',
            sellExchange: 'bybit',
            capitalUSD: 25,
        });
        expect(result.isProfitable).toBe(true);
        expect(result.netProfit).toBeLessThan(result.grossProfit);
        expect(result.fees.buyFee).toBeGreaterThan(0);
    });

    test('marks trade not profitable when gross profit barely covers fees', async () => {
        const result = await pm.analyzeProfitability({
            type: 'cross',
            pair: 'ETH/USDT',
            profit: 0.3,       // 0.3% gross – likely eaten by fees
            volume: 25,
            buyExchange: 'kraken',
            sellExchange: 'poloniex',
            capitalUSD: 25,
        });
        expect(result.isProfitable).toBe(false);
        expect(result.recommendation).toMatch(/SKIP/);
    });

    test('net profit is always less than gross profit (fees reduce it)', async () => {
        const result = await pm.analyzeProfitability({
            type: 'cross',
            pair: 'SOL/USDT',
            profit: 1.5,
            volume: 100,
            buyExchange: 'binance',
            sellExchange: 'gateio',
            capitalUSD: 50,
        });
        expect(result.netProfit).toBeLessThan(result.grossProfit);
    });

    test('optimizeProfits returns strategy and execution plan', async () => {
        const result = await pm.optimizeProfits();
        expect(result).toHaveProperty('strategies');
        expect(result).toHaveProperty('execution');
        expect(result).toHaveProperty('monitoring');
    });

    test('getCachedResult returns previously computed result', async () => {
        await pm.analyzeProfitability({
            type: 'cross',
            pair: 'XRP/USDT',
            profit: 1.0,
            volume: 25,
            buyExchange: 'binance',
            sellExchange: 'bybit',
        });
        const cached = pm.getCachedResult('XRP/USDT', 'binance', 'bybit');
        expect(cached).toBeDefined();
        expect(cached).toHaveProperty('timestamp');
    });
});

describe('TriangularArbitrage', () => {
    let tri: TriangularArbitrage;
    let manager: ExchangeManager;

    beforeEach(() => {
        manager = new ExchangeManager();
        tri = new TriangularArbitrage(manager);
    });

    test('instantiates without errors', () => {
        expect(tri).toBeDefined();
    });

    test('findTriangularOpportunities runs without throwing for known exchange', async () => {
        await expect(tri.findTriangularOpportunities('binance', 'USDT')).resolves.toBeUndefined();
    });
});

describe('ExchangeManager', () => {
    test('getExchange returns undefined for unknown exchange', () => {
        const manager = new ExchangeManager();
        const ex = manager.getExchange('nonexistent');
        expect(ex).toBeUndefined();
    });

    test('getAllExchanges returns a Map', () => {
        const manager = new ExchangeManager();
        const exchanges = manager.getAllExchanges();
        expect(exchanges).toBeInstanceOf(Map);
    });
});
