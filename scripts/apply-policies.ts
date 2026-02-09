
import { getPrisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
    const prisma = getPrisma();
    const sqlPath = path.join(process.cwd(), 'scripts', 'policies.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Applying polices from:', sqlPath);

    // Split by semicolon to run statements individually, as executeRaw might not handle multiple statements well depending on driver
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const statement of statements) {
        try {
            if (statement.startsWith('--')) continue;
            console.log('Executing:', statement.substring(0, 50) + '...');
            await prisma.$executeRawUnsafe(statement);
            console.log('Success.');
        } catch (e: any) {
            console.error('Error executing statement:', e.message);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
