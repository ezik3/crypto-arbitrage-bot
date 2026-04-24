"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairManager = void 0;
const config_1 = require("../config");
class PairManager {
    constructor() {
        this.consolidatedPairs = new Map();
        this.initializePairs();
    }
    static getInstance() {
        if (!PairManager.instance) {
            PairManager.instance = new PairManager();
        }
        return PairManager.instance;
    }
    initializePairs() {
        for (const [exchange, pairConfig] of Object.entries(config_1.config.exchangePairs)) {
            const pairs = Array.isArray(pairConfig)
                ? pairConfig
                : pairConfig.pairs || [];
            this.consolidatedPairs.set(exchange, new Set(pairs));
        }
    }
    getPairsForExchange(exchange) {
        return Array.from(this.consolidatedPairs.get(exchange) || []);
    }
    getAllUniquePairs() {
        const allPairs = new Set();
        this.consolidatedPairs.forEach(pairs => {
            pairs.forEach(pair => allPairs.add(pair));
        });
        return Array.from(allPairs);
    }
}
exports.PairManager = PairManager;
