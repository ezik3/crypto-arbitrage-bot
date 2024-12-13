
import { ArbitrageBot } from './bot';

async function main() {
    const bot = new ArbitrageBot();
    await bot.start();
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
