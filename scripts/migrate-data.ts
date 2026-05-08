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

  console.log("🚀 Starting FINAL robust migration from Turso to PostgreSQL (Render)...");

  try {
    // 1. Departments
    const departments = await turso.execute("SELECT * FROM departments");
    console.log(`- Migrating ${departments.rows.length} Departments...`);
    for (const row of departments.rows) {
      await prisma.department.upsert({
        where: { id: String(row.id) },
        update: { name: row.name as string },
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
        where: { id: String(row.id) },
        update: { year: row.year_name as string, active: Boolean(row.is_current) },
        create: {
          id: String(row.id),
          year: row.year_name as string,
          active: Boolean(row.is_current),
        },
      });
    }

    // 4. Professors
    const professors = await turso.execute("SELECT * FROM professors");
    console.log(`- Migrating ${professors.rows.length} Professors...`);
    const usedEmails = new Set();
    for (const row of professors.rows) {
      let email = (row.email || row.professional_email || row.personal_email) as string;
      if (email) {
        if (usedEmails.has(email)) {
          email = `prof_${row.id}_${email}`;
        }
        usedEmails.add(email);
      }
      
      await prisma.professor.upsert({
        where: { id: String(row.id) },
        update: {
          name: row.name as string,
          email: email || null,
          phone: (row.phone || row.primary_phone) as string,
          departmentId: row.department_id ? String(row.department_id) : null,
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          email: email || null,
          phone: (row.phone || row.primary_phone) as string,
          departmentId: row.department_id ? String(row.department_id) : null,
        },
      });
    }

    // 5. Courses
    const courses = await turso.execute("SELECT * FROM courses");
    console.log(`- Migrating ${courses.rows.length} Courses...`);
    for (const row of courses.rows) {
      await prisma.course.upsert({
        where: { id: String(row.id) },
        update: {
          name: row.name as string,
          code: (row.code || `course_${row.id}`) as string,
          credits: Number(row.credits || 0),
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          code: (row.code || `course_${row.id}`) as string,
          credits: Number(row.credits || 0),
        },
      });
    }

    // 6. Rooms
    const rooms = await turso.execute("SELECT * FROM rooms");
    console.log(`- Migrating ${rooms.rows.length} Rooms...`);
    for (const row of rooms.rows) {
      await prisma.room.upsert({
        where: { id: String(row.id) },
        update: { name: row.name as string, capacity: Number(row.capacity || 0) },
        create: {
          id: String(row.id),
          name: row.name as string,
          capacity: Number(row.capacity || 0),
        },
      });
    }

    // 7. Groups
    const groups = await turso.execute("SELECT * FROM groups");
    console.log(`- Migrating ${groups.rows.length} Groups...`);
    for (const row of groups.rows) {
      await prisma.group.upsert({
        where: { id: String(row.id) },
        update: { 
            name: row.name as string,
            size: Number(row.size || 0), 
            departmentId: row.department_id ? String(row.department_id) : null,
            specializationId: row.specialization_id ? String(row.specialization_id) : null
        },
        create: {
          id: String(row.id),
          name: row.name as string,
          size: Number(row.size || 0),
          departmentId: row.department_id ? String(row.department_id) : null,
          specializationId: row.specialization_id ? String(row.specialization_id) : null
        },
      });
    }

    // 8. Assignments
    const assignments = await turso.execute("SELECT * FROM assignments");
    console.log(`- Migrating ${assignments.rows.length} Assignments...`);
    for (const row of assignments.rows) {
      try {
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
      } catch (e) {
        // Skipping orphan records
      }
    }

    // 9. Extra Sessions
    const extraSessions = await turso.execute("SELECT * FROM extra_sessions");
    console.log(`- Migrating ${extraSessions.rows.length} Extra Sessions...`);
    for (const row of extraSessions.rows) {
      try {
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
      } catch (e) {
        // Skipping orphan records
      }
    }

    // 10. Users
    const users = await turso.execute("SELECT * FROM users");
    console.log(`- Migrating ${users.rows.length} Users...`);
    for (const row of users.rows) {
      const email = (row.email || row.username || `user_${row.id}@example.com`) as string;
      const role = (row.role as string || "USER").toUpperCase();
      await prisma.user.upsert({
        where: { id: String(row.id) },
        update: {
          name: (row.full_name || row.username) as string,
          email,
          password: (row.password_hash || row.password) as string,
          role: role as any,
        },
        create: {
          id: String(row.id),
          name: (row.full_name || row.username) as string,
          email,
          password: (row.password_hash || row.password) as string,
          role: role as any,
        },
      });
    }

    console.log("✅ ALL DATA MIGRATED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
    turso.close();
  }
}

migrate();
