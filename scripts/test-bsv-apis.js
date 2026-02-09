// Test script to verify BSV API connectivity
console.log('🧪 Testing BSV API Connectivity...\n');

// Test BSV address (you can replace with your actual address)
const testAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Bitcoin genesis address for testing

async function testBSVAPIs() {
  console.log('1. Testing BSV Balance APIs...\n');
  
  const balanceApis = [
    `https://api.whatsonchain.com/v1/bsv/main/address/${testAddress}/balance`,
    `https://api.taal.com/bsv/v1/address/${testAddress}/balance`,
    `https://api.bitails.io/address/${testAddress}/balance`
  ];
  
  for (const apiUrl of balanceApis) {
    try {
      console.log(`Testing: ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Response:`, data);
      } else {
        console.log(`   Error: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   Failed: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('2. Testing BSV21 Token APIs...\n');
  
  const tokenApis = [
    `https://api.whatsonchain.com/v1/bsv/main/address/${testAddress}/tokens`,
    `https://api.taal.com/bsv/v1/address/${testAddress}/tokens`,
    `https://api.bitails.io/address/${testAddress}/tokens`
  ];
  
  for (const apiUrl of tokenApis) {
    try {
      console.log(`Testing: ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Response:`, data);
      } else {
        console.log(`   Error: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   Failed: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('3. Testing with your actual wallet address...\n');
  console.log('To test with your real wallet:');
  console.log('1. Connect your Yours wallet to the boardroom');
  console.log('2. Check the browser console for API responses');
  console.log('3. Look for logs starting with [Yours]');
  console.log('');
  console.log('If APIs are working, you should see:');
  console.log('- BSV balance fetched from blockchain');
  console.log('- BSV21 tokens (like BOASE) detected');
  console.log('- Real token balances displayed');
  console.log('');
  console.log('If APIs are not working, you might see:');
  console.log('- "Failed to fetch from..." warnings');
  console.log('- "No real tokens found" message');
  console.log('- Need to implement fallback or use different APIs');
}

// Run the test
testBSVAPIs().catch(console.error); 