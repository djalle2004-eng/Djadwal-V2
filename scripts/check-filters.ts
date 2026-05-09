import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const assignments = await prisma.assignment.findMany({
    take: 10,
    select: {
      id: true,
      semester: true,
      academicYear: true
    }
  });

  console.log('Assignments Sample:');
  console.table(assignments);

  const semesters = await prisma.semester.findMany({
    take: 5,
    select: {
      id: true,
      name: true
    }
  });

  console.log('Semesters Sample:');
  console.table(semesters);

  const academicYears = await prisma.academicYear.findMany({
    take: 5,
    select: {
      id: true,
      year: true
    }
  });

  console.log('Academic Years Sample:');
  console.table(academicYears);
}

check();
