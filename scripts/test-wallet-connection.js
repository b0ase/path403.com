import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testWalletConnection() {
  console.log('🔗 Testing Wallet Connection Flow...\n');

  try {
    // Test 1: Try to send message without wallet (should fail)
    console.log('1. Testing message without wallet connection...');
    const responseUnauth = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello without wallet',
        roomId: 'general',
        userId: 'web-user',
        username: 'Anonymous',
        tokens: []
      }),
    });

    const dataUnauth = await responseUnauth.json();
    
    if (responseUnauth.status === 401) {
      console.log('✅ Authentication required (as expected)');
      console.log(`   Bot response: "${dataUnauth.botMessage}"`);
    } else {
      console.log('❌ Unexpected response:', responseUnauth.status, dataUnauth);
    }

    // Test 2: Try to send message with wallet connection (should work)
    console.log('\n2. Testing message with wallet connection...');
    const responseAuth = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from Phantom wallet user!',
        roomId: 'general',
        userId: 'wallet_ABC123...XYZ789',
        username: 'Web User (Phantom)',
        tokens: ['SOL', 'BOASE']
      }),
    });

    const dataAuth = await responseAuth.json();
    
    if (responseAuth.ok) {
      console.log('✅ Authenticated message sent successfully');
      console.log(`   Message ID: ${dataAuth.message.id}`);
      console.log(`   Username: ${dataAuth.message.username}`);
      console.log(`   Tokens: ${dataAuth.message.tokens.join(', ')}`);
    } else {
      console.log('❌ Authenticated message failed:', dataAuth.error);
    }

    // Test 3: Verify message appears in chat
    console.log('\n3. Verifying message appears in chat...');
    const getResponse = await fetch(`${BASE_URL}/api/boardroom/chat?roomId=general`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ Messages retrieved successfully');
      console.log(`   Total messages: ${getData.messages.length}`);
      
      const latestMessage = getData.messages[getData.messages.length - 1];
      console.log(`   Latest message: "${latestMessage.message}" by ${latestMessage.username}`);
      
      if (latestMessage.tokens && latestMessage.tokens.length > 0) {
        console.log(`   User tokens: ${latestMessage.tokens.join(', ')}`);
      }
    } else {
      console.log('❌ Failed to retrieve messages:', getData.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testWalletConnection(); 