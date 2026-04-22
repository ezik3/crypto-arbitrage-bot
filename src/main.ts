import { ArbitrageBot } from './bot';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    console.log('🚀 Starting Crypto Arbitrage Bot');
    console.log('===============================');
    
    // Check if we have any API keys
    const hasApiKeys = process.env.BINANCE_API_KEY || 
                      process.env.BYBIT_API_KEY || 
                      process.env.KRAKEN_API_KEY || 
                      process.env.GATEIO_API_KEY;
    
    if (!hasApiKeys) {
        console.log('⚠️  No API keys found in .env file');
        console.log('📝 Please add API keys to .env file or use test mode');
        console.log('💡 Example: BINANCE_API_KEY=your_key_here');
        console.log('');
    }

    console.log('📊 Available Strategies:');
    console.log('   1. CEX Arbitrage - Cross-exchange price differences');
    console.log('   2. Triangular Arbitrage - Three-currency loops');
    console.log('');
    
    console.log('🔧 Initializing bot...');
    
    try {
        const bot = new ArbitrageBot();
        
        console.log('✅ Bot initialized successfully');
        console.log('');
        console.log('🔍 Starting opportunity scanning...');
        console.log('   (Press Ctrl+C to stop)');
        console.log('');
        
        // Start the bot
        await bot.start();
        
    } catch (error: any) {
        console.error('❌ Failed to start bot:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    process.exit(0);
});

// Run the bot
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Unhandled error:', error);
        process.exit(1);
    });
}

export { ArbitrageBot };