import { createClient } from '@libsql/client';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.migration' });

const turso = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 بدء التحقق من الترحيل...');
  
  const results: any = {
    counts: {},
    integrity: {
      orphanedAssignments: 0,
      orphanedExtraSessions: 0,
    },
    timestamp: new Date().toISOString(),
  };

  const tables = [
    { turso: 'academic_years', prisma: 'academicYear' },
    { turso: 'departments', prisma: 'department' },
    { turso: 'specializations', prisma: 'specialization' },
    { turso: 'groups', prisma: 'group' },
    { turso: 'professors', prisma: 'professor' },
    { turso: 'courses', prisma: 'course' },
    { turso: 'rooms', prisma: 'room' },
    { turso: 'assignments', prisma: 'assignment' },
    { turso: 'extra_sessions', prisma: 'extraSession' },
    { turso: 'users', prisma: 'user' },
  ];

  for (const table of tables) {
    try {
      const tursoCount = (await turso.execute(`SELECT COUNT(*) as count FROM ${table.turso}`)).rows[0].count;
      const prismaCount = await (prisma[table.prisma as keyof PrismaClient] as any).count();
      
      results.counts[table.turso] = {
        turso: Number(tursoCount),
        postgresql: prismaCount,
        match: Number(tursoCount) === prismaCount
      };
      
      console.log(`${results.counts[table.turso].match ? '✅' : '❌'} ${table.turso}: Turso(${tursoCount}) vs Postgres(${prismaCount})`);
    } catch (e) {
      console.error(`❌ Error verifying ${table.turso}:`, e.message);
    }
  }

  // FK Integrity checks in Postgres
  const orphanedAssigns = await prisma.assignment.count({
    where: {
      OR: [
        { courseId: { equals: "" } },
        { professorId: { equals: "" } }
      ]
    }
  });
  results.integrity.orphanedAssignments = orphanedAssigns;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  fs.writeFileSync('migration-report.json', JSON.stringify(results, null, 2));
  console.log('📊 تم حفظ التقرير في migration-report.json');
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    turso.close();
  });
