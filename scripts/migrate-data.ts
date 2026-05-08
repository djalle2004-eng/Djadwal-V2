import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";

const TURSO_URL = "libsql://djadwal2-djalle.aws-eu-west-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTU1NjIsImlkIjoiMDE5ZGVkNTItMTIwMC03NzMxLTg3YTEtNzI3ODZiMzMzNDUwIiwicmlkIjoiMzZhMDhjYTktYWIzNS00NWY2LTg5YjItNWFiYzQwMWU5ZTI4In0.ReCQJbAVkFkklKA170BwRPf6KHqBNS8KncLM3z4boKGMtW5FOgWUA0SF79lkLaxyBaDOSVMvUOwO4BUIuTOIDg";

const prisma = new PrismaClient();

async function migrate() {
  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  console.log("🚀 Starting migration from Turso to PostgreSQL...");

  try {
    // 1. Migrate Academic Years
    const years = await turso.execute("SELECT * FROM academic_years");
    console.log(`- Migrating ${years.rows.length} Academic Years...`);
    for (const row of years.rows) {
      await prisma.academicYear.upsert({
        where: { year: row.year as string },
        update: { active: Boolean(row.active) },
        create: {
          id: String(row.id),
          year: row.year as string,
          active: Boolean(row.active),
        },
      });
    }

    // 2. Migrate Professors
    const professors = await turso.execute("SELECT * FROM professors");
    console.log(`- Migrating ${professors.rows.length} Professors...`);
    for (const row of professors.rows) {
      await prisma.professor.upsert({
        where: { id: String(row.id) },
        update: {
          name: row.name as string,
          email: row.email as string,
          phone: row.phone as string,
          department: row.department as string,
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          email: row.email as string,
          phone: row.phone as string,
          department: row.department as string,
        },
      });
    }

    // 3. Migrate Courses
    const courses = await turso.execute("SELECT * FROM courses");
    console.log(`- Migrating ${courses.rows.length} Courses...`);
    for (const row of courses.rows) {
      await prisma.course.upsert({
        where: { code: row.code as string },
        update: {
          name: row.name as string,
          credits: Number(row.credits),
          description: row.description as string,
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          code: row.code as string,
          credits: Number(row.credits),
          description: row.description as string,
        },
      });
    }

    // 4. Migrate Rooms
    const rooms = await turso.execute("SELECT * FROM rooms");
    console.log(`- Migrating ${rooms.rows.length} Rooms...`);
    for (const row of rooms.rows) {
      await prisma.room.upsert({
        where: { name: row.name as string },
        update: { capacity: Number(row.capacity), type: row.type as string },
        create: {
          id: String(row.id),
          name: row.name as string,
          capacity: Number(row.capacity),
          type: row.type as string,
        },
      });
    }

    // 5. Migrate Groups
    const groups = await turso.execute("SELECT * FROM groups");
    console.log(`- Migrating ${groups.rows.length} Groups...`);
    for (const row of groups.rows) {
      await prisma.group.upsert({
        where: { name: row.name as string },
        update: { size: Number(row.size) },
        create: {
          id: String(row.id),
          name: row.name as string,
          size: Number(row.size),
        },
      });
    }

    // 6. Migrate Users
    const users = await turso.execute("SELECT * FROM users");
    console.log(`- Migrating ${users.rows.length} Users...`);
    for (const row of users.rows) {
      await prisma.user.upsert({
        where: { email: row.email as string },
        update: {
          name: row.name as string,
          password: row.password as string,
          role: (row.role as string).toUpperCase() as any,
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          email: row.email as string,
          password: row.password as string,
          role: (row.role as string).toUpperCase() as any,
        },
      });
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
    turso.close();
  }
}

migrate();
