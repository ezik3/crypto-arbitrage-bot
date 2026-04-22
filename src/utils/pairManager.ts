import { config } from '../config';
import { ExchangePairs } from '../types/config';

export class PairManager {
    private static instance: PairManager;
    private consolidatedPairs: Map<string, Set<string>> = new Map();

    private constructor() {
        this.initializePairs();
    }

    static getInstance(): PairManager {
        if (!PairManager.instance) {
            PairManager.instance = new PairManager();
        }
        return PairManager.instance;
    }

    private initializePairs() {
        for (const [exchange, pairConfig] of Object.entries(config.exchangePairs)) {
            const pairs = Array.isArray(pairConfig) 
                ? pairConfig 
                : (pairConfig as any).pairs || [];
            this.consolidatedPairs.set(exchange, new Set(pairs));
        }
    }

    public getPairsForExchange(exchange: string): string[] {
        return Array.from(this.consolidatedPairs.get(exchange) || []);
    }

    public getAllUniquePairs(): string[] {
        const allPairs = new Set<string>();
        this.consolidatedPairs.forEach(pairs => {
            pairs.forEach(pair => allPairs.add(pair));
        });
        return Array.from(allPairs);
    }
}
