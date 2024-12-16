import { ArbitrageOrchestrator } from './core/arbitrageOrchestrator';
import dotenv from 'dotenv';
import { DappRadarAPI } from './sniping/apis/dappRadar';
import { LiveCoinWatchAPI } from './sniping/apis/liveCoinWatch';
// Temporarily comment out QuillAI until you have the API key
// import { QuillAIAPI } from './sniping/apis/quillai';

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

    // Test API connections
    console.log('\nTesting API connections...');
    
    console.log('\nTesting DappRadar API:');
    await dappRadar.testConnection();
    
    console.log('\nTesting LiveCoinWatch API:');
    await liveCoinWatch.testApiConnection();
    
    try {
        await orchestrator.initialize();
        await orchestrator.startArbitrageLoop();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main().catch(console.error);