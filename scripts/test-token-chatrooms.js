import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testTokenChatRooms() {
  console.log('🏠 Testing Dynamic Token-Based Chat Rooms...\n');

  try {
    // Test 1: Send message to SOL holders room
    console.log('1. Testing SOL Holders chat room...');
    const responseSOL = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello SOL holders! What\'s the latest on Solana?',
        roomId: 'sol-holders',
        userId: 'wallet_SOL_HOLDER_123',
        username: 'SOL1...XYZ9 (Phantom)',
        tokens: ['SOL']
      }),
    });

    const dataSOL = await responseSOL.json();
    
    if (responseSOL.ok) {
      console.log('✅ SOL message sent successfully');
      console.log(`   Room: sol-holders`);
      console.log(`   Username: ${dataSOL.message.username}`);
      console.log(`   Tokens: ${dataSOL.message.tokens.join(', ')}`);
    } else {
      console.log('❌ SOL message failed:', dataSOL.error);
    }

    // Test 2: Send message to BOASE holders room
    console.log('\n2. Testing BOASE Holders chat room...');
    const responseBOASE = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'BOASE token holders unite! 🚀',
        roomId: 'boase-holders',
        userId: 'wallet_BOASE_HOLDER_456',
        username: 'BOASE1...ABC9 (Phantom)',
        tokens: ['BOASE']
      }),
    });

    const dataBOASE = await responseBOASE.json();
    
    if (responseBOASE.ok) {
      console.log('✅ BOASE message sent successfully');
      console.log(`   Room: boase-holders`);
      console.log(`   Username: ${dataBOASE.message.username}`);
      console.log(`   Tokens: ${dataBOASE.message.tokens.join(', ')}`);
    } else {
      console.log('❌ BOASE message failed:', dataBOASE.error);
    }

    // Test 3: Send message to Multi-Token VIP room
    console.log('\n3. Testing Multi-Token VIP chat room...');
    const responseVIP = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'VIP multi-token holder here! 🏆',
        roomId: 'multi-token-vip',
        userId: 'wallet_VIP_HOLDER_789',
        username: 'VIP1...DEF9 (Phantom)',
        tokens: ['SOL', 'BOASE', 'USDC']
      }),
    });

    const dataVIP = await responseVIP.json();
    
    if (responseVIP.ok) {
      console.log('✅ VIP message sent successfully');
      console.log(`   Room: multi-token-vip`);
      console.log(`   Username: ${dataVIP.message.username}`);
      console.log(`   Tokens: ${dataVIP.message.tokens.join(', ')}`);
    } else {
      console.log('❌ VIP message failed:', dataVIP.error);
    }

    // Test 4: Verify messages in different rooms
    console.log('\n4. Verifying messages in different rooms...');
    
    const rooms = ['general', 'sol-holders', 'boase-holders', 'multi-token-vip'];
    
    for (const room of rooms) {
      const getResponse = await fetch(`${BASE_URL}/api/boardroom/chat?roomId=${room}`);
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        console.log(`   ${room}: ${getData.messages.length} messages`);
        if (getData.messages.length > 0) {
          const latestMessage = getData.messages[getData.messages.length - 1];
          console.log(`     Latest: "${latestMessage.message}" by ${latestMessage.username}`);
        }
      } else {
        console.log(`   ${room}: Failed to retrieve messages`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testTokenChatRooms(); 