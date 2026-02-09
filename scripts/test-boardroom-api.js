// Test script for Boardroom Members API
const BASE_URL = 'http://localhost:3000'; // Change this to your domain in production

async function testBoardroomAPI() {
  console.log('🧪 Testing Boardroom Members API...\n');

  // Test 1: Get all members
  console.log('1️⃣ Testing GET /api/boardroom/members');
  try {
    const response = await fetch(`${BASE_URL}/api/boardroom/members`);
    const data = await response.json();
    console.log('✅ GET Response:', data);
  } catch (error) {
    console.error('❌ GET Error:', error);
  }

  // Test 2: Add a new member from bot
  console.log('\n2️⃣ Testing POST /api/boardroom/members (bot member)');
  try {
    const response = await fetch(`${BASE_URL}/api/boardroom/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Board_Room_Bot',
        role: 'System Admin',
        wallet_address: null,
        source: 'bot'
      })
    });
    const data = await response.json();
    console.log('✅ POST Response (bot):', data);
  } catch (error) {
    console.error('❌ POST Error (bot):', error);
  }

  // Test 3: Add a new member from website
  console.log('\n3️⃣ Testing POST /api/boardroom/members (website member)');
  try {
    const response = await fetch(`${BASE_URL}/api/boardroom/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'TestUser',
        role: 'Investor',
        wallet_address: '0x1234567890abcdef',
        source: 'website'
      })
    });
    const data = await response.json();
    console.log('✅ POST Response (website):', data);
  } catch (error) {
    console.error('❌ POST Error (website):', error);
  }

  // Test 4: Get members again to see the new ones
  console.log('\n4️⃣ Testing GET /api/boardroom/members (after adding)');
  try {
    const response = await fetch(`${BASE_URL}/api/boardroom/members`);
    const data = await response.json();
    console.log('✅ GET Response (updated):', data);
  } catch (error) {
    console.error('❌ GET Error (updated):', error);
  }
}

// Run the test
testBoardroomAPI().catch(console.error); 