import { PairManager } from '../utils/pairManager';
import { PairValidator } from '../utils/pairValidator';
import { ExchangeManager } from '../exchanges/exchangeManager';
import { config } from '../config';

async function testPairExpansion() {
    const exchangeManager = new ExchangeManager();
    const pairValidator = new PairValidator(exchangeManager);
    const pairManager = PairManager.getInstance();

    console.log('Testing expanded pair configuration...');

    for (const exchange of config.exchanges) {
        const pairs = pairManager.getPairsForExchange(exchange.name);
        console.log(`\nTesting ${exchange.name}: ${pairs.length} pairs`);
        
        const validPairs = await pairValidator.validatePairsForExchange(exchange.name, pairs);
        console.log(`Valid pairs: ${validPairs.length}/${pairs.length}`);
    }
}

testPairExpansion().catch(console.error);
