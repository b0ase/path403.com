import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testPersistentChatRooms() {
  console.log('🏠 Testing Persistent Chat Room System...\n');

  try {
    // Test 1: Create chat rooms for tokens
    console.log('1. Creating chat rooms for tokens...');
    const createResponse = await fetch(`${BASE_URL}/api/boardroom/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: [
          { symbol: 'SOL', balance: '1.5' },
          { symbol: 'USDC', balance: '1000' },
          { symbol: 'JUP', balance: '50' }
        ],
        walletAddress: 'yVqSkQG8B1mVGdaU6EbAJRdfB86NoZ25EhDvxPCwYu9'
      }),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Chat rooms created successfully');
      console.log(`   Created rooms: ${createData.createdRooms.length}`);
      createData.createdRooms.forEach(room => {
        console.log(`   - ${room.token}: ${room.roomId}`);
      });
    } else {
      const errorData = await createResponse.json();
      console.log('❌ Failed to create chat rooms:', errorData.error);
    }

    // Test 2: Fetch available chat rooms
    console.log('\n2. Fetching available chat rooms...');
    const fetchResponse = await fetch(`${BASE_URL}/api/boardroom/rooms?tokens=SOL,USDC,JUP&wallet=yVqSkQG8B1mVGdaU6EbAJRdfB86NoZ25EhDvxPCwYu9`);
    
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json();
      console.log('✅ Chat rooms fetched successfully');
      console.log(`   Available rooms: ${fetchData.rooms.length}`);
      
      fetchData.rooms.forEach(room => {
        const accessStatus = room.has_access ? '✅ Access' : '❌ No Access';
        console.log(`   - ${room.name} (${room.id}): ${accessStatus}`);
        console.log(`     Required tokens: ${room.required_tokens.join(', ') || 'None'}`);
      });
    } else {
      const errorData = await fetchResponse.json();
      console.log('❌ Failed to fetch chat rooms:', errorData.error);
    }

    // Test 3: Test with different token set
    console.log('\n3. Testing with different token set (only SOL)...');
    const fetchResponse2 = await fetch(`${BASE_URL}/api/boardroom/rooms?tokens=SOL&wallet=yVqSkQG8B1mVGdaU6EbAJRdfB86NoZ25EhDvxPCwYu9`);
    
    if (fetchResponse2.ok) {
      const fetchData2 = await fetchResponse2.json();
      console.log('✅ Chat rooms fetched for SOL-only user');
      console.log(`   Available rooms: ${fetchData2.rooms.length}`);
      
      fetchData2.rooms.forEach(room => {
        const accessStatus = room.has_access ? '✅ Access' : '❌ No Access';
        console.log(`   - ${room.name} (${room.id}): ${accessStatus}`);
      });
    } else {
      const errorData = await fetchResponse2.json();
      console.log('❌ Failed to fetch chat rooms for SOL user:', errorData.error);
    }

    // Test 4: Test with no tokens
    console.log('\n4. Testing with no tokens...');
    const fetchResponse3 = await fetch(`${BASE_URL}/api/boardroom/rooms?tokens=&wallet=yVqSkQG8B1mVGdaU6EbAJRdfB86NoZ25EhDvxPCwYu9`);
    
    if (fetchResponse3.ok) {
      const fetchData3 = await fetchResponse3.json();
      console.log('✅ Chat rooms fetched for user with no tokens');
      console.log(`   Available rooms: ${fetchData3.rooms.length}`);
      
      fetchData3.rooms.forEach(room => {
        const accessStatus = room.has_access ? '✅ Access' : '❌ No Access';
        console.log(`   - ${room.name} (${room.id}): ${accessStatus}`);
      });
    } else {
      const errorData = await fetchResponse3.json();
      console.log('❌ Failed to fetch chat rooms for no-token user:', errorData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPersistentChatRooms(); 