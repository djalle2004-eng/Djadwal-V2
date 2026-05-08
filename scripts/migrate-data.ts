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

  console.log("🚀 Starting comprehensive migration from Turso to PostgreSQL...");

  try {
    // 1. Departments
    const departments = await turso.execute("SELECT * FROM departments");
    console.log(`- Migrating ${departments.rows.length} Departments...`);
    for (const row of departments.rows) {
      await prisma.department.upsert({
        where: { name: row.name as string },
        update: {},
        create: {
          id: String(row.id),
          name: row.name as string,
        },
      });
    }

    // 2. Specializations
    const specializations = await turso.execute("SELECT * FROM specializations");
    console.log(`- Migrating ${specializations.rows.length} Specializations...`);
    for (const row of specializations.rows) {
      await prisma.specialization.upsert({
        where: { id: String(row.id) },
        update: { name: row.name as string, departmentId: String(row.department_id) },
        create: {
          id: String(row.id),
          name: row.name as string,
          departmentId: String(row.department_id),
        },
      });
    }

    // 3. Academic Years
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

    // 4. Professors
    const professors = await turso.execute("SELECT * FROM professors");
    console.log(`- Migrating ${professors.rows.length} Professors...`);
    for (const row of professors.rows) {
      await prisma.professor.upsert({
        where: { id: String(row.id) },
        update: {
          name: row.name as string,
          email: row.email as string,
          phone: row.phone as string,
          departmentId: row.department_id ? String(row.department_id) : null,
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          email: row.email as string,
          phone: row.phone as string,
          departmentId: row.department_id ? String(row.department_id) : null,
        },
      });
    }

    // 5. Courses
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

    // 6. Rooms
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

    // 7. Groups
    const groups = await turso.execute("SELECT * FROM groups");
    console.log(`- Migrating ${groups.rows.length} Groups...`);
    for (const row of groups.rows) {
      await prisma.group.upsert({
        where: { name: row.name as string },
        update: { 
            size: Number(row.size), 
            departmentId: row.department_id ? String(row.department_id) : null,
            specializationId: row.specialization_id ? String(row.specialization_id) : null
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          size: Number(row.size),
          departmentId: row.department_id ? String(row.department_id) : null,
          specializationId: row.specialization_id ? String(row.specialization_id) : null
        },
      });
    }

    // 8. Assignments
    const assignments = await turso.execute("SELECT * FROM assignments");
    console.log(`- Migrating ${assignments.rows.length} Assignments...`);
    for (const row of assignments.rows) {
      await prisma.assignment.upsert({
        where: { id: String(row.id) },
        update: {
          groupId: row.group_id ? String(row.group_id) : null,
          courseId: String(row.course_id),
          professorId: String(row.professor_id),
          roomId: String(row.room_id),
          dayOfWeek: Number(row.day_of_week),
          startTime: row.start_time as string,
          endTime: row.end_time as string,
          sessionType: row.session_type as string,
          academicYear: row.academic_year as string,
          semester: row.semester as string,
          specialization: row.specialization as string,
        },
        create: {
          id: String(row.id),
          groupId: row.group_id ? String(row.group_id) : null,
          courseId: String(row.course_id),
          professorId: String(row.professor_id),
          roomId: String(row.room_id),
          dayOfWeek: Number(row.day_of_week),
          startTime: row.start_time as string,
          endTime: row.end_time as string,
          sessionType: row.session_type as string,
          academicYear: row.academic_year as string,
          semester: row.semester as string,
          specialization: row.specialization as string,
        },
      });
    }

    // 9. Extra Sessions
    const extraSessions = await turso.execute("SELECT * FROM extra_sessions");
    console.log(`- Migrating ${extraSessions.rows.length} Extra Sessions...`);
    for (const row of extraSessions.rows) {
      await prisma.extraSession.upsert({
        where: { id: String(row.id) },
        update: {
          groupId: row.group_id ? String(row.group_id) : null,
          courseId: String(row.course_id),
          professorId: String(row.professor_id),
          roomId: String(row.room_id),
          sessionDate: row.session_date as string,
          startTime: row.start_time as string,
          endTime: row.end_time as string,
          description: row.description as string,
          sessionType: row.session_type as string,
          academicYear: row.academic_year as string,
          semester: row.semester as string,
          reason: row.reason as string,
          isArchived: Boolean(row.is_archived),
          examNote: row.exam_note as string,
        },
        create: {
          id: String(row.id),
          groupId: row.group_id ? String(row.group_id) : null,
          courseId: String(row.course_id),
          professorId: String(row.professor_id),
          roomId: String(row.room_id),
          sessionDate: row.session_date as string,
          startTime: row.start_time as string,
          endTime: row.end_time as string,
          description: row.description as string,
          sessionType: row.session_type as string,
          academicYear: row.academic_year as string,
          semester: row.semester as string,
          reason: row.reason as string,
          isArchived: Boolean(row.is_archived),
          examNote: row.exam_note as string,
        },
      });
    }

    // 10. Users
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

    console.log("✅ Comprehensive migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
    turso.close();
  }
}

migrate();
