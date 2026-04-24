/// <reference types="jest" />
import { PairManager } from '../utils/pairManager';
import { ExchangeManager } from '../exchanges/exchangeManager';
import { config } from '../config';

describe('Pair Expansion Tests', () => {
    test('PairManager returns pairs for configured exchanges', () => {
        const pairManager = PairManager.getInstance();
        for (const exchange of config.exchanges) {
            const pairs = pairManager.getPairsForExchange(exchange.name);
            expect(Array.isArray(pairs)).toBe(true);
        }
    });

    test('ExchangeManager initializes without errors', () => {
        const exchangeManager = new ExchangeManager();
        expect(exchangeManager).toBeDefined();
    });
});
