// Test script to verify room access function works with undefined rooms

// Mock the hasRoomAccess function with the fix
const hasRoomAccess = (room) => {
  if (!room) return false;
  if (room.requiredTokens.length === 0) return true;
  if (!room.connectedWallet) return false;
  
  const userTokenSymbols = room.userTokens ? room.userTokens.map(token => token.symbol) : [];
  return room.requiredTokens.every(requiredToken => 
    userTokenSymbols.includes(requiredToken)
  );
};

// Test cases
console.log('🧪 Testing Room Access Function Fix...\n');

// Test 1: Undefined room
console.log('1. Testing undefined room:');
const result1 = hasRoomAccess(undefined);
console.log(`   Result: ${result1} (should be false)`);
console.log(`   ✅ ${result1 === false ? 'PASS' : 'FAIL'}\n`);

// Test 2: Room with no required tokens
console.log('2. Testing room with no required tokens:');
const room2 = {
  id: 'general',
  requiredTokens: [],
  connectedWallet: true,
  userTokens: []
};
const result2 = hasRoomAccess(room2);
console.log(`   Result: ${result2} (should be true)`);
console.log(`   ✅ ${result2 === true ? 'PASS' : 'FAIL'}\n`);

// Test 3: Room with required tokens, user has them
console.log('3. Testing room with required tokens, user has them:');
const room3 = {
  id: 'sol-holders',
  requiredTokens: ['SOL'],
  connectedWallet: true,
  userTokens: [{ symbol: 'SOL' }, { symbol: 'BOASE' }]
};
const result3 = hasRoomAccess(room3);
console.log(`   Result: ${result3} (should be true)`);
console.log(`   ✅ ${result3 === true ? 'PASS' : 'FAIL'}\n`);

// Test 4: Room with required tokens, user doesn\'t have them
console.log('4. Testing room with required tokens, user doesn\'t have them:');
const room4 = {
  id: 'sol-holders',
  requiredTokens: ['SOL'],
  connectedWallet: true,
  userTokens: [{ symbol: 'BOASE' }]
};
const result4 = hasRoomAccess(room4);
console.log(`   Result: ${result4} (should be false)`);
console.log(`   ✅ ${result4 === false ? 'PASS' : 'FAIL'}\n`);

// Test 5: Room with required tokens, no wallet connected
console.log('5. Testing room with required tokens, no wallet connected:');
const room5 = {
  id: 'sol-holders',
  requiredTokens: ['SOL'],
  connectedWallet: false,
  userTokens: [{ symbol: 'SOL' }]
};
const result5 = hasRoomAccess(room5);
console.log(`   Result: ${result5} (should be false)`);
console.log(`   ✅ ${result5 === false ? 'PASS' : 'FAIL'}\n`);

console.log('🎉 All tests completed!'); 