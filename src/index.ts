import { ArbitrageOrchestrator } from './core/arbitrageOrchestrator';

async function main() {
    console.log('Starting arbitrage bot...');
    const orchestrator = new ArbitrageOrchestrator();
    
    try {
        await orchestrator.initialize();
        await orchestrator.startArbitrageLoop();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main().catch(console.error);