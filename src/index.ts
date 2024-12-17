import { ArbitrageOrchestrator } from './core/arbitrageOrchestrator';
import dotenv from 'dotenv';
import { DappRadarAPI } from './sniping/apis/dappRadar';
import { LiveCoinWatchAPI } from './sniping/apis/liveCoinWatch';
// Temporarily comment out QuillAI until you have the API key
// import { QuillAIAPI } from './sniping/apis/quillai';
import { GateIoExchange } from './exchanges/gateio';

async function main() {
    console.log('Starting arbitrage bot...');
    const orchestrator = new ArbitrageOrchestrator();
    
    // Load environment variables
    dotenv.config();

    // Initialize APIs
    const dappRadar = new DappRadarAPI(process.env.DAPPRADAR_API_KEY!);
    const liveCoinWatch = new LiveCoinWatchAPI(process.env.LIVECOINWATCH_API_KEY!);
    // Temporarily comment out QuillAI until you have the API key
    // const quillai = new QuillAIAPI(process.env.QUILLAI_API_KEY!);
    const gateio = new GateIoExchange(process.env.GATEIO_API_KEY!, process.env.GATEIO_API_SECRET!);

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
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main().catch(console.error);