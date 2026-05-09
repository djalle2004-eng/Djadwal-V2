import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const semesterId   = searchParams.get("semesterId");
  const departmentId = searchParams.get("departmentId");

  const where: any = {};
  if (semesterId) where.semester = semesterId;

  if (departmentId) {
    const groups = await db.group.findMany({ where: { departmentId }, select: { id: true } });
    where.groupId = { in: groups.map((g) => g.id) };
  }

  const assignments = await db.assignment.findMany({
    where,
    include: {
      course:    { select: { id: true, name: true } },
      professor: { select: { id: true, name: true } },
      group:     { select: { id: true, name: true } },
      room:      { select: { id: true, name: true } },
    },
  });

  // Detect conflicts: group by (dayOfWeek + startTime + professorId|roomId|groupId)
  const conflicts: any[] = [];
  
  // Professor conflicts
  const profMap = new Map<string, typeof assignments>();
  assignments.forEach((a) => {
    const key = `${a.dayOfWeek}-${a.startTime}-prof-${a.professorId}`;
    if (!profMap.has(key)) profMap.set(key, []);
    profMap.get(key)!.push(a);
  });
  profMap.forEach((sessions, key) => {
    if (sessions.length > 1) {
      conflicts.push({ type: "professor", sessions: sessions.map((s) => s.id), message: `الأستاذ ${sessions[0].professor?.name} لديه ${sessions.length} حصص في نفس الوقت` });
    }
  });

  // Room conflicts
  const roomMap = new Map<string, typeof assignments>();
  assignments.forEach((a) => {
    if (!a.roomId) return;
    const key = `${a.dayOfWeek}-${a.startTime}-room-${a.roomId}`;
    if (!roomMap.has(key)) roomMap.set(key, []);
    roomMap.get(key)!.push(a);
  });
  roomMap.forEach((sessions) => {
    if (sessions.length > 1) {
      conflicts.push({ type: "room", sessions: sessions.map((s) => s.id), message: `القاعة ${sessions[0].room?.name} محجوزة لأكثر من حصة في نفس الوقت` });
    }
  });

  // Group conflicts
  const groupMap = new Map<string, typeof assignments>();
  assignments.forEach((a) => {
    if (!a.groupId) return;
    const key = `${a.dayOfWeek}-${a.startTime}-group-${a.groupId}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(a);
  });
  groupMap.forEach((sessions) => {
    if (sessions.length > 1) {
      conflicts.push({ type: "group", sessions: sessions.map((s) => s.id), message: `المجموعة ${sessions[0].group?.name} لديها ${sessions.length} حصص في نفس الوقت` });
    }
  });

  return NextResponse.json({ conflicts, total: conflicts.length });
}
