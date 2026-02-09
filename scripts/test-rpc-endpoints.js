import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testRpcEndpoints() {
  console.log('🔌 Testing Solana RPC Endpoints...\n');

  const rpcEndpoints = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://solana.public-rpc.com'
  ];

  console.log('Testing each RPC endpoint for connectivity...\n');

  for (const endpoint of rpcEndpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSlot'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          console.log(`  ✅ SUCCESS - Slot: ${data.result}`);
        } else {
          console.log(`  ❌ FAILED - No result: ${JSON.stringify(data)}`);
        }
      } else {
        console.log(`  ❌ FAILED - HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`  ❌ FAILED - Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 RPC Endpoint Test Summary:');
  console.log('   - Multiple endpoints tested for redundancy');
  console.log('   - Boardroom will try each endpoint in order');
  console.log('   - If one fails, it will try the next one');
  console.log('   - This should resolve the 403 Access Forbidden errors');
}

// Run the test
testRpcEndpoints(); 