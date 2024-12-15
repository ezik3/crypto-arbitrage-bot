import { ArbitrageOrchestrator } from './core/arbitrageOrchestrator';

async function main() {
    console.log('Starting arbitrage bot...');
    const orchestrator = new ArbitrageOrchestrator();
    
    try {
        await orchestrator.initialize();
        console.log('Starting arbitrage loop...');
        await orchestrator.startArbitrageLoop();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

main().catch((error) => {
    console.error('Fatal error in main:', error);
    process.exit(1);
});