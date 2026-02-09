const { PrismaClient } = require('@prisma/client');
const bsv = require('@bsv/sdk');

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Vault API...');
  
  // 1. Setup Test User
  const userId = 'custody-test-user-v2';
  try {
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            handcashHandle: 'custody_tester'
        }
    });
    console.log(`✅ User ${userId} ready.`);
  } catch (e) {
      console.log('User setup warning (might exist):', e.message);
  }

  // Check if Vault model exists on client
  if (!prisma.vault) {
      console.error('❌ FATAL: prisma.vault is undefined in the test script client!');
  } else {
      console.log('✅ prisma.vault exists in test script.');
  }

  // 2. Mock a User Key
  const priv = bsv.PrivateKey.fromRandom();
  const pubKey = priv.toPublicKey().toString();
  console.log('🔑 Generated Test User PubKey:', pubKey);

  // 3. Call API
  const response = await fetch('http://localhost:3000/api/custody/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userPublicKey: pubKey })
  });

  const data = await response.json();
  if (response.status === 200) {
      console.log('✅ Vault Created:', data);
      if (data.address.startsWith('3') || data.address.startsWith('2')) { // simplified check
          console.log('✅ Address looks like P2SH:', data.address);
      } else {
          console.warn('⚠️ Address format might be unexpected:', data.address);
      }
      // Check redundancy in DB
      const dbVault = await prisma.vault.findUnique({ where: { userId } });
      console.log('📦 DB Record Verification:', dbVault ? 'Matches' : 'MISSING');
  } else {
      console.error('❌ API Error:', data);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
