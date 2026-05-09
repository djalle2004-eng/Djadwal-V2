import { createClient } from '@libsql/client';
import { PrismaClient, Role } from '@prisma/client';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.migration' });

const turso = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 بدء الترحيل من Turso إلى PostgreSQL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const startTime = Date.now();
  const summary = {
    total: 0,
    success: 0,
    skipped: 0,
  };

  // ID Mapping to keep relationships intact
  const idMap: Record<string, Record<string, string>> = {
    AcademicYear: {},
    Semester: {},
    Department: {},
    Specialization: {},
    Group: {},
    Professor: {},
    Course: {},
    Room: {},
  };

  function mapId(model: string, oldId: any): string {
    const stringId = String(oldId);
    if (!idMap[model][stringId]) {
      idMap[model][stringId] = randomUUID();
    }
    return idMap[model][stringId];
  }

  try {
    // 1. Academic Years
    const years = await turso.execute('SELECT * FROM academic_years');
    for (const row of years.rows) {
      try {
        const newId = mapId('AcademicYear', row.id);
        await prisma.academicYear.upsert({
          where: { year: row.year_name as string },
          update: {},
          create: {
            id: newId,
            year: row.year_name as string,
            active: Boolean(row.is_current),
          },
        });
        summary.success++;
      } catch (e) {
        console.error(`❌ Error migrating AcademicYear ${row.id}:`, e);
        summary.skipped++;
      }
    }
    console.log(`✅ academic_years: ${years.rows.length} سجلات تم ترحيلها`);

    // 2. Semesters (If any in Turso, otherwise skip)
    // Assuming semesters table exists or skipping if not
    try {
        const semesters = await turso.execute('SELECT * FROM semesters');
        for (const row of semesters.rows) {
            try {
                const newId = mapId('Semester', row.id);
                await prisma.semester.upsert({
                    where: { id: newId },
                    update: {},
                    create: {
                        id: newId,
                        name: row.name as string,
                        isCurrent: Boolean(row.is_current),
                        academicYearId: mapId('AcademicYear', row.academic_year_id),
                    },
                });
                summary.success++;
            } catch (e) {
                summary.skipped++;
            }
        }
        console.log(`✅ semesters: ${semesters.rows.length} سجلات تم ترحيلها`);
    } catch (e) {
        console.log('ℹ️ semesters table not found in Turso, skipping...');
    }

    // 3. Departments
    const depts = await turso.execute('SELECT * FROM departments');
    for (const row of depts.rows) {
      try {
        const newId = mapId('Department', row.id);
        await prisma.department.upsert({
          where: { name: row.name as string },
          update: {},
          create: {
            id: newId,
            name: row.name as string,
            code: row.code as string || null,
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ departments: ${depts.rows.length} سجلات تم ترحيلها`);

    // 4. Specializations
    const specs = await turso.execute('SELECT * FROM specializations');
    for (const row of specs.rows) {
      try {
        const newId = mapId('Specialization', row.id);
        await prisma.specialization.upsert({
          where: { id: newId },
          update: {},
          create: {
            id: newId,
            name: row.name as string,
            departmentId: mapId('Department', row.department_id),
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ specializations: ${specs.rows.length} سجلات تم ترحيلها`);

    // 5. Groups
    const groups = await turso.execute('SELECT * FROM groups');
    for (const row of groups.rows) {
      try {
        const newId = mapId('Group', row.id);
        await prisma.group.upsert({
          where: { id: newId },
          update: {},
          create: {
            id: newId,
            name: row.name as string,
            size: Number(row.size || row.capacity || 30),
            departmentId: row.department_id ? mapId('Department', row.department_id) : null,
            specializationId: row.specialization_id ? mapId('Specialization', row.specialization_id) : null,
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ groups: ${groups.rows.length} سجلات تم ترحيلها`);

    // 6. Professors
    const profs = await turso.execute('SELECT * FROM professors');
    for (const row of profs.rows) {
      try {
        const newId = mapId('Professor', row.id);
        await prisma.professor.upsert({
          where: { email: row.email as string || `prof_${row.id}@example.com` },
          update: {},
          create: {
            id: newId,
            name: row.name as string,
            email: row.email as string || null,
            phone: row.phone as string || null,
            departmentId: row.department_id ? mapId('Department', row.department_id) : null,
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ professors: ${profs.rows.length} سجلات تم ترحيلها`);

    // 7. Courses
    const courses = await turso.execute('SELECT * FROM courses');
    for (const row of courses.rows) {
      try {
        const newId = mapId('Course', row.id);
        await prisma.course.upsert({
          where: { code: row.code as string || `C-${row.id}` },
          update: {},
          create: {
            id: newId,
            name: row.name as string,
            code: row.code as string || `C-${row.id}`,
            credits: Number(row.credits || 0),
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ courses: ${courses.rows.length} سجلات تم ترحيلها`);

    // 8. Rooms
    const rooms = await turso.execute('SELECT * FROM rooms');
    for (const row of rooms.rows) {
      try {
        const newId = mapId('Room', row.id);
        await prisma.room.upsert({
          where: { name: row.name as string },
          update: {},
          create: {
            id: newId,
            name: row.name as string,
            capacity: Number(row.capacity || 0),
            type: row.type as string || null,
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ rooms: ${rooms.rows.length} سجلات تم ترحيلها`);

    // 9. Assignments
    const assigns = await turso.execute('SELECT * FROM assignments');
    for (const row of assigns.rows) {
      try {
        await prisma.assignment.create({
          data: {
            id: randomUUID(),
            courseId: mapId('Course', row.course_id),
            professorId: mapId('Professor', row.professor_id),
            groupId: row.group_id ? mapId('Group', row.group_id) : null,
            roomId: row.room_id ? mapId('Room', row.room_id) : null,
            dayOfWeek: Number(row.day_of_week || 0),
            startTime: row.start_time as string || "08:00",
            endTime: row.end_time as string || "10:00",
            sessionType: row.session_type as string || "lecture",
            academicYear: row.academic_year as string || null,
            semester: row.semester as string || null,
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ assignments: ${assigns.rows.length} سجلات تم ترحيلها`);

    // 10. Extra Sessions
    const extras = await turso.execute('SELECT * FROM extra_sessions');
    for (const row of extras.rows) {
      try {
        await prisma.extraSession.create({
          data: {
            id: randomUUID(),
            courseId: mapId('Course', row.course_id),
            professorId: mapId('Professor', row.professor_id),
            groupId: row.group_id ? mapId('Group', row.group_id) : null,
            roomId: mapId('Room', row.room_id),
            sessionDate: row.session_date as string,
            startTime: row.start_time as string,
            endTime: row.end_time as string,
            description: row.description as string || null,
            sessionType: row.session_type as string || null,
            academicYear: row.academic_year as string || null,
            semester: row.semester as string || null,
            isArchived: Boolean(row.is_archived),
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ extra_sessions: ${extras.rows.length} سجلات تم ترحيلها`);

    // 11. Print Settings
    try {
        const settings = await turso.execute('SELECT * FROM print_settings');
        for (const row of settings.rows) {
            try {
                await prisma.printSettings.create({
                    data: {
                        universityName: row.university_name as string || null,
                        facultyName: row.faculty_name as string || null,
                    }
                });
                summary.success++;
            } catch (e) {
                summary.skipped++;
            }
        }
        console.log(`✅ print_settings: ${settings.rows.length} سجلات تم ترحيلها`);
    } catch (e) {}

    // 12. Users
    const users = await turso.execute('SELECT * FROM users');
    for (const row of users.rows) {
      try {
        await prisma.user.upsert({
          where: { email: row.email as string || `user_${row.id}@example.com` },
          update: {},
          create: {
            id: randomUUID(),
            name: row.full_name as string || row.username as string || "User",
            email: row.email as string || null,
            password: row.password_hash as string || row.password as string || null,
            role: (row.role as string || "USER").toUpperCase() as Role,
          },
        });
        summary.success++;
      } catch (e) {
        summary.skipped++;
      }
    }
    console.log(`✅ users: ${users.rows.length} سجلات تم ترحيلها`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ملخص الترحيل:');
    console.log(`   - إجمالي السجلات المعالجة تقريباً: ${summary.success + summary.skipped}`);
    console.log(`   - نجح: ${summary.success}`);
    console.log(`   - تخطى: ${summary.skipped}`);
    console.log(`   - وقت الترحيل: ${duration} ثانية`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    turso.close();
  }
}

migrate();
