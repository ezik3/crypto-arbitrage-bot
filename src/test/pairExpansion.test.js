"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pairManager_1 = require("../utils/pairManager");
const pairValidator_1 = require("../utils/pairValidator");
const exchangeManager_1 = require("../exchanges/exchangeManager");
const config_1 = require("../config");
async function testPairExpansion() {
    const exchangeManager = new exchangeManager_1.ExchangeManager(config_1.config.exchanges);
    const pairValidator = new pairValidator_1.PairValidator(exchangeManager);
    const pairManager = pairManager_1.PairManager.getInstance();
    console.log('Testing expanded pair configuration...');
    for (const exchange of config_1.config.exchanges) {
        const pairs = pairManager.getPairsForExchange(exchange.name);
        console.log(`\nTesting ${exchange.name}: ${pairs.length} pairs`);
        const validPairs = await pairValidator.validatePairsForExchange(exchange.name, pairs);
        console.log(`Valid pairs: ${validPairs.length}/${pairs.length}`);
    }
}
testPairExpansion().catch(console.error);
