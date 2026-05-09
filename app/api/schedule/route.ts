import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupId      = searchParams.get("groupId");
  const professorId  = searchParams.get("professorId");
  const roomId       = searchParams.get("roomId");
  const departmentId = searchParams.get("departmentId");
  const semester     = searchParams.get("semester");
  const academicYear = searchParams.get("academicYear");

  // Build dynamic where clause
  const where: any = {};
  if (groupId)      where.groupId      = groupId;
  if (professorId)  where.professorId  = professorId;
  if (roomId)       where.roomId       = roomId;
  if (semester)     where.semester     = semester;
  if (academicYear) where.academicYear = academicYear;

  // For department view, find all groups in that department first
  if (departmentId) {
    const groups = await db.group.findMany({
      where: { departmentId },
      select: { id: true },
    });
    where.groupId = { in: groups.map((g) => g.id) };
  }

  const assignments = await db.assignment.findMany({
    where,
    include: {
      course:     { select: { id: true, name: true, code: true } },
      professor:  { select: { id: true, name: true } },
      group:      { select: { id: true, name: true } },
      room:       { select: { id: true, name: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(assignments);
}
