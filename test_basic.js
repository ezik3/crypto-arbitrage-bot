// Basic test to verify the bot compiles and runs
const { exec } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing Crypto Arbitrage Bot Setup');
console.log('====================================');

// Check if TypeScript compiles
console.log('1. Checking TypeScript compilation...');
exec('npx tsc --noEmit', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ TypeScript compilation failed:');
        console.log(stderr);
        process.exit(1);
    }
    
    console.log('✅ TypeScript compilation successful');
    
    // Check if main.ts exists
    console.log('2. Checking main entry point...');
    if (fs.existsSync('src/main.ts')) {
        console.log('✅ main.ts exists');
    } else {
        console.log('❌ main.ts not found');
        process.exit(1);
    }
    
    // Check if bot.ts exists
    console.log('3. Checking bot.ts...');
    if (fs.existsSync('src/bot.ts')) {
        console.log('✅ bot.ts exists');
    } else {
        console.log('❌ bot.ts not found');
        process.exit(1);
    }
    
    // Check if config exists
    console.log('4. Checking config.ts...');
    if (fs.existsSync('src/config.ts')) {
        console.log('✅ config.ts exists');
    } else {
        console.log('❌ config.ts not found');
        process.exit(1);
    }
    
    // Check if exchange manager exists
    console.log('5. Checking exchange manager...');
    if (fs.existsSync('src/exchanges/exchangeManager.ts')) {
        console.log('✅ exchangeManager.ts exists');
    } else {
        console.log('❌ exchangeManager.ts not found');
        process.exit(1);
    }
    
    console.log('\n🎉 ALL CHECKS PASSED!');
    console.log('\n🚀 To start the bot:');
    console.log('   npm run dev');
    console.log('\n📊 Dashboard will be available at:');
    console.log('   http://localhost:3000');
    console.log('\n💡 Remember to create .env file with your API keys!');
});