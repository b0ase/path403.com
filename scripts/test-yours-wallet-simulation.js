// Test script to verify Yours wallet simulation
console.log('🧪 Testing Yours Wallet Simulation...\n');

// Simulate the same logic as in the frontend
function simulateYoursWalletConnection() {
  console.log('1. Simulating Yours wallet connection...');
  
  const tokens = [];
  
  // Simulate BSV balance (50% chance)
  const hasBsv = Math.random() > 0.5;
  if (hasBsv) {
    const bsvBalance = Math.random() * 10;
    tokens.push({
      symbol: 'BSV',
      name: 'Bitcoin SV',
      balance: bsvBalance.toFixed(8),
      contract: 'BSV_NATIVE'
    });
    console.log(`   ✅ Found BSV: ${bsvBalance.toFixed(8)}`);
  } else {
    console.log('   ❌ No BSV found');
  }
  
  // Simulate BOASE tokens (50% chance)
  const hasBoaseTokens = Math.random() > 0.5;
  if (hasBoaseTokens) {
    const boaseBalance = Math.floor(Math.random() * 1000) + 1;
    tokens.push({
      symbol: 'BOASE',
      name: 'BOASE Token',
      balance: boaseBalance.toString(),
      contract: 'BSV21_BOASE_CONTRACT'
    });
    console.log(`   ✅ Found BOASE: ${boaseBalance}`);
  } else {
    console.log('   ❌ No BOASE tokens found');
  }
  
  console.log(`\n2. Total tokens found: ${tokens.length}`);
  console.log('   Tokens:', tokens);
  
  // Simulate token symbols for API
  const userTokenSymbols = tokens.map(t => t.symbol);
  console.log(`\n3. Token symbols for API: ${userTokenSymbols.join(', ')}`);
  
  // Simulate authentication check
  const isAuthenticated = userTokenSymbols.length > 0;
  console.log(`\n4. Authentication check: ${isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}`);
  
  return {
    tokens,
    userTokenSymbols,
    isAuthenticated
  };
}

// Run multiple simulations
console.log('Running 5 simulations to test randomness:\n');

for (let i = 1; i <= 5; i++) {
  console.log(`--- Simulation ${i} ---`);
  const result = simulateYoursWalletConnection();
  console.log(`Result: ${result.isAuthenticated ? 'SUCCESS' : 'FAILED'}\n`);
}

console.log('🎯 Expected Behavior:');
console.log('- Some simulations should find tokens (authenticated)');
console.log('- Some simulations should find no tokens (not authenticated)');
console.log('- This randomness helps test both scenarios'); 