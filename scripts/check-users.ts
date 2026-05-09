import { createClient } from '@libsql/client';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.migration' });

const turso = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const prisma = new PrismaClient();

async function checkUsers() {
  const tursoUsers = await turso.execute('SELECT id, email, username, full_name FROM users');
  console.log('--- Turso Users ---');
  tursoUsers.rows.forEach(r => console.log(r));

  const pgUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true }
  });
  console.log('\n--- Postgres Users ---');
  pgUsers.forEach(u => console.log(u));
}

checkUsers().finally(() => {
  prisma.$disconnect();
  turso.close();
});
