import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const counts = {
    departments: await prisma.department.count(),
    professors: await prisma.professor.count(),
    courses: await prisma.course.count(),
    rooms: await prisma.room.count(),
    groups: await prisma.group.count(),
    assignments: await prisma.assignment.count(),
    extraSessions: await prisma.extraSession.count(),
    users: await prisma.user.count(),
  };
  console.table(counts);
  await prisma.$disconnect();
}

check();
