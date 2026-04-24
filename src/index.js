"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arbitrageOrchestrator_1 = require("./core/arbitrageOrchestrator");
const dotenv_1 = __importDefault(require("dotenv"));
const dappRadar_1 = require("./sniping/apis/dappRadar");
const liveCoinWatch_1 = require("./sniping/apis/liveCoinWatch");
// Temporarily comment out QuillAI until you have the API key
// import { QuillAIAPI } from './sniping/apis/quillai';
const gateio_1 = require("./exchanges/gateio");
async function main() {
    console.log('Starting arbitrage bot...');
    const orchestrator = new arbitrageOrchestrator_1.ArbitrageOrchestrator();
    // Load environment variables
    dotenv_1.default.config();
    // Initialize APIs
    const dappRadar = new dappRadar_1.DappRadarAPI(process.env.DAPPRADAR_API_KEY);
    const liveCoinWatch = new liveCoinWatch_1.LiveCoinWatchAPI(process.env.LIVECOINWATCH_API_KEY);
    // Temporarily comment out QuillAI until you have the API key
    // const quillai = new QuillAIAPI(process.env.QUILLAI_API_KEY!);
    const gateio = new gateio_1.GateIoExchange(process.env.GATEIO_API_KEY, process.env.GATEIO_API_SECRET);
    // Test API connections
    console.log('\nTesting API connections...');
    console.log('\nTesting DappRadar API:');
    await dappRadar.testConnection();
    console.log('\nTesting LiveCoinWatch API:');
    await liveCoinWatch.testApiConnection();
    console.log('\nTesting Gate.io API:');
    await gateio.testConnection();
    try {
        await orchestrator.initialize();
        await orchestrator.startArbitrageLoop();
    }
    catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}
main().catch(console.error);
