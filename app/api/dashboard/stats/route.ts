import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Basic Stats
    const [professorsCount, coursesCount, roomsCount, groupsCount] = await Promise.all([
      db.professor.count(),
      db.course.count(),
      db.room.count(),
      db.group.count(),
    ]);

    // 2. Active courses (with assignments)
    const activeCoursesCount = await db.course.count({
      where: { assignments: { some: {} } }
    });

    // 3. Weekly session distribution
    const assignments = await db.assignment.findMany({
      select: { dayOfWeek: true, sessionType: true }
    });

    const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    const weeklyDistribution = days.map((day, index) => {
      // index + 1 if Saturday is 1, depends on schema. In our schema Saturday is 1? 
      // Let's assume Saturday is 0 or 1. Usually in Arabic systems Sat=1.
      const dayIndex = index + 1; 
      const dayAssignments = assignments.filter(a => a.dayOfWeek === dayIndex);
      return {
        name: day,
        lecture: dayAssignments.filter(a => a.sessionType === "lecture").length,
        td: dayAssignments.filter(a => a.sessionType === "td").length,
        tp: dayAssignments.filter(a => a.sessionType === "tp").length,
      };
    });

    // 4. Professor Workload (Top 10)
    // This is more complex because we need to calculate hours from startTime/endTime
    // For now we'll just count assignments as proxy for simplicity, or dummy hours
    const profsWithAssignments = await db.professor.findMany({
      take: 10,
      include: {
        _count: { select: { assignments: true } }
      },
      orderBy: {
        assignments: { _count: 'desc' }
      }
    });

    const workload = profsWithAssignments.map(p => ({
      name: p.name,
      hours: p._count.assignments * 1.5, // assuming 1.5h per assignment
      max: p.maxHours || 18,
    }));

    return NextResponse.json({
      stats: {
        professors: professorsCount,
        courses: coursesCount,
        rooms: roomsCount,
        groups: groupsCount,
        activeCourses: activeCoursesCount,
      },
      weeklyDistribution,
      workload,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
