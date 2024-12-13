    import { ArbitrageOrchestrator } from './core/arbitrageOrchestrator';

    async function main() {
        console.log('Starting arbitrage bot...');
        const orchestrator = new ArbitrageOrchestrator();
    
        await orchestrator.initialize();
        await orchestrator.startArbitrageLoop();
    }

    main().catch(console.error);