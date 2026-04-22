// Compile only core files
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Compiling core arbitrage bot files...');

const coreFiles = [
  'src/main.ts',
  'src/bot.ts',
  'src/config.ts',
  'src/triangular.ts',
  'src/exchanges/exchangeManager.ts',
  'src/exchanges/gateio.ts',
  'src/exchanges/types.ts',
  'src/utils/rateLimiter.ts',
  'src/utils/pairValidator.ts'
];

// Check which files exist
const existingFiles = coreFiles.filter(file => fs.existsSync(file));

console.log(`📁 Found ${existingFiles.length} core files:`);
existingFiles.forEach(file => console.log(`  ✅ ${file}`));

// Create a temporary tsconfig for core files only
const tempTsConfig = {
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "downlevelIteration": true
  },
  "include": existingFiles
};

fs.writeFileSync('tsconfig.core.json', JSON.stringify(tempTsConfig, null, 2));

try {
  console.log('\n⚡ Compiling TypeScript...');
  execSync('npx tsc --noEmit --project tsconfig.core.json', { stdio: 'inherit' });
  console.log('\n🎉 SUCCESS! Core files compile without errors!');
  
  // Clean up
  fs.unlinkSync('tsconfig.core.json');
  
  console.log('\n🚀 Ready to run: npm run dev');
  console.log('💡 Remember to create .env file first!');
  
} catch (error) {
  console.error('\n❌ Compilation failed');
  // Clean up even on error
  if (fs.existsSync('tsconfig.core.json')) {
    fs.unlinkSync('tsconfig.core.json');
  }
  process.exit(1);
}