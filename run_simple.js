// Simple test runner for the arbitrage bot
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Testing Crypto Arbitrage Bot - Simple Version');
console.log('===============================================');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file for testing...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ Created .env file (using test mode)');
}

// Check if TypeScript compiles
console.log('\n🔧 Checking TypeScript compilation...');
try {
  require('child_process').execSync('npx tsc --noEmit src/main.ts', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (e) {
  console.log('❌ TypeScript compilation failed');
  console.log(e.stderr?.toString() || e.message);
  process.exit(1);
}

// Check core files
console.log('\n📁 Checking core files...');
const requiredFiles = [
  'src/main.ts',
  'src/bot.ts', 
  'src/config.ts',
  'src/triangular.ts',
  'src/exchanges/exchangeManager.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Missing required files');
  process.exit(1);
}

console.log('\n🎉 ALL CHECKS PASSED!');
console.log('\n🚀 Your bot is ready to run:');
console.log('\n   npm run dev');
console.log('\n📊 Or with test mode (recommended):');
console.log('\n   TEST_MODE=true npm run dev');
console.log('\n💡 The bot will:');
console.log('   1. Scan for CEX arbitrage opportunities');
console.log('   2. Run triangular arbitrage scans');
console.log('   3. Use virtual $100 in test mode');
console.log('   4. Log opportunities to console');
console.log('\n🛑 Press Ctrl+C to stop');
console.log('\n🔥 LET\'S GO!');