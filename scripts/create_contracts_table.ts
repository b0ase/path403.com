
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Manual Migration...');

    try {
        // 1. Fundraising Rounds
        console.log('Creating fundraising_rounds if not exists...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS fundraising_rounds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stage_id UUID UNIQUE NOT NULL,
        target_amount DECIMAL(10, 2) NOT NULL,
        raised_amount DECIMAL(10, 2) DEFAULT 0,
        min_investment DECIMAL(10, 2) DEFAULT 10,
        max_investment DECIMAL(10, 2),
        equity_token_count INT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMPTZ(6) DEFAULT NOW()
      );
    `);

        // 2. Investor Allocations
        console.log('Creating investor_allocations if not exists...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS investor_allocations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_id UUID NOT NULL,
        investor_user_id UUID NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pledged',
        created_at TIMESTAMPTZ(6) DEFAULT NOW()
      );
    `);

        // 3. Contracts
        console.log('Creating contracts if not exists...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        type VARCHAR(50),
        created_at TIMESTAMPTZ(6) DEFAULT NOW(),
        updated_at TIMESTAMPTZ(6) DEFAULT NOW()
      );
    `);

        // 4. Marketplace Tenders
        console.log('Creating marketplace_tenders if not exists...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS marketplace_tenders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stage_id UUID NOT NULL,
        budget_max DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        awarded_developer_id UUID,
        contract_id UUID,
        created_at TIMESTAMPTZ(6) DEFAULT NOW()
      );
    `);

        console.log('Migration successful.');

    } catch (e) {
        console.error('Error during migration:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
