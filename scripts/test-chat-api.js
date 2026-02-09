import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testChatAPI() {
  console.log('🧪 Testing Boardroom Chat API...\n');

  try {
    // Test 1: Get messages (should work for anyone)
    console.log('1. Testing GET /api/boardroom/chat...');
    const getResponse = await fetch(`${BASE_URL}/api/boardroom/chat?roomId=general`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET messages successful');
      console.log(`   Found ${getData.messages.length} messages`);
      if (getData.messages.length > 0) {
        console.log(`   Latest message: "${getData.messages[getData.messages.length - 1].message}"`);
      }
    } else {
      console.log('❌ GET messages failed:', getData.error);
    }

    // Test 2: Try to send message without authentication (should fail)
    console.log('\n2. Testing POST /api/boardroom/chat (unauthenticated)...');
    const postResponseUnauth = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from unauthenticated user',
        roomId: 'general',
        userId: 'web-user',
        username: 'Anonymous',
        tokens: []
      }),
    });

    const postDataUnauth = await postResponseUnauth.json();
    
    if (postResponseUnauth.status === 401) {
      console.log('✅ Authentication required (as expected)');
      console.log(`   Bot message: "${postDataUnauth.botMessage}"`);
    } else {
      console.log('❌ Unexpected response:', postResponseUnauth.status, postDataUnauth);
    }

    // Test 3: Try to send message with authentication (should work)
    console.log('\n3. Testing POST /api/boardroom/chat (authenticated)...');
    const postResponseAuth = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from authenticated user with tokens!',
        roomId: 'general',
        userId: 'telegram_123',
        username: 'Test User',
        tokens: ['BOASE', 'SOL']
      }),
    });

    const postDataAuth = await postResponseAuth.json();
    
    if (postResponseAuth.ok) {
      console.log('✅ Authenticated message sent successfully');
      console.log(`   Message ID: ${postDataAuth.message.id}`);
    } else {
      console.log('❌ Authenticated message failed:', postDataAuth.error);
    }

    // Test 4: Get messages again to see the new message
    console.log('\n4. Testing GET /api/boardroom/chat (after sending message)...');
    const getResponse2 = await fetch(`${BASE_URL}/api/boardroom/chat?roomId=general`);
    const getData2 = await getResponse2.json();
    
    if (getResponse2.ok) {
      console.log('✅ GET messages successful after sending');
      console.log(`   Total messages: ${getData2.messages.length}`);
      const latestMessage = getData2.messages[getData2.messages.length - 1];
      console.log(`   Latest message: "${latestMessage.message}" by ${latestMessage.username}`);
    } else {
      console.log('❌ GET messages failed:', getData2.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testChatAPI(); 