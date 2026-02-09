import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testUsernameDisplay() {
  console.log('👤 Testing Username Display with Wallet Addresses...\n');

  try {
    // Test 1: Send message with wallet address (should show shortened address)
    console.log('1. Testing message with wallet address...');
    const responseWallet = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from my wallet!',
        roomId: 'general',
        userId: 'wallet_ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567',
        username: 'ABC1...YZA5 (Phantom)',
        tokens: ['SOL', 'BOASE']
      }),
    });

    const dataWallet = await responseWallet.json();
    
    if (responseWallet.ok) {
      console.log('✅ Wallet message sent successfully');
      console.log(`   Username: ${dataWallet.message.username}`);
      console.log(`   Expected format: ABC1...YZA5 (Phantom)`);
    } else {
      console.log('❌ Wallet message failed:', dataWallet.error);
    }

    // Test 2: Send message with account name (should show account name)
    console.log('\n2. Testing message with account name...');
    const responseAccount = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from my named account!',
        roomId: 'general',
        userId: 'wallet_XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234',
        username: 'My Solana Account (Phantom)',
        tokens: ['SOL', 'BOASE']
      }),
    });

    const dataAccount = await responseAccount.json();
    
    if (responseAccount.ok) {
      console.log('✅ Account message sent successfully');
      console.log(`   Username: ${dataAccount.message.username}`);
      console.log(`   Expected format: My Solana Account (Phantom)`);
    } else {
      console.log('❌ Account message failed:', dataAccount.error);
    }

    // Test 3: Verify both messages appear in chat
    console.log('\n3. Verifying messages appear in chat...');
    const getResponse = await fetch(`${BASE_URL}/api/boardroom/chat?roomId=general`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ Messages retrieved successfully');
      console.log(`   Total messages: ${getData.messages.length}`);
      
      // Find our test messages
      const walletMessage = getData.messages.find(msg => msg.message === 'Hello from my wallet!');
      const accountMessage = getData.messages.find(msg => msg.message === 'Hello from my named account!');
      
      if (walletMessage) {
        console.log(`   Wallet message username: "${walletMessage.username}"`);
      }
      
      if (accountMessage) {
        console.log(`   Account message username: "${accountMessage.username}"`);
      }
    } else {
      console.log('❌ Failed to retrieve messages:', getData.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testUsernameDisplay(); 