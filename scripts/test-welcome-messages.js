import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testWelcomeMessages() {
  console.log('🏠 Testing Updated Welcome Messages...\n');

  try {
    // Test 1: Get messages from general room
    console.log('1. Fetching welcome messages from general room...');
    const response = await fetch(`${BASE_URL}/api/boardroom/chat?roomId=general`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.messages && data.messages.length > 0) {
      console.log('✅ Welcome messages found:');
      data.messages.forEach((msg, index) => {
        console.log(`   Message ${index + 1}:`);
        console.log(`   Username: ${msg.username}`);
        console.log(`   Content: ${msg.message}`);
        console.log('');
      });
      
      // Check if messages are updated
      const hasOldMessage = data.messages.some(msg => 
        msg.message.includes('can still read') || 
        msg.message.includes('If you don\'t have the required tokens')
      );
      
      if (hasOldMessage) {
        console.log('❌ OLD MESSAGES STILL PRESENT - Browser cache issue!');
        console.log('   Please hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)');
      } else {
        console.log('✅ Welcome messages are correctly updated!');
      }
    } else {
      console.log('❌ No messages found');
    }

    // Test 2: Test authentication error message
    console.log('\n2. Testing authentication error message...');
    const authResponse = await fetch(`${BASE_URL}/api/boardroom/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message without authentication',
        roomId: 'general',
        userId: 'test_user',
        username: 'Test User',
        tokens: []
      }),
    });

    const authData = await authResponse.json();
    
    if (authResponse.status === 401) {
      console.log('✅ Authentication required (correct)');
      console.log(`   Bot message: ${authData.botMessage}`);
      
      // Check if bot message is updated
      if (authData.botMessage.includes('can still read') || 
          authData.botMessage.includes('If you don\'t have the required tokens')) {
        console.log('❌ OLD BOT MESSAGE - Frontend cache issue!');
      } else {
        console.log('✅ Bot message is correctly updated!');
      }
    } else {
      console.log('❌ Unexpected response:', authResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWelcomeMessages(); 