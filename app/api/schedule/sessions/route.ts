import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const sessionSchema = z.object({
  courseId:    z.string().min(1, "المادة مطلوبة"),
  professorId: z.string().min(1, "الأستاذ مطلوب"),
  groupId:     z.string().optional().or(z.literal("")),
  roomId:      z.string().optional().or(z.literal("")),
  dayOfWeek:   z.number().min(1).max(6),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/),
  sessionType: z.enum(["lecture", "td", "tp", "exam"]).default("lecture"),
  semester:    z.string().optional(),
  academicYear: z.string().optional(),
  specialization: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = sessionSchema.parse(body);

    // --- Conflict checks ---
    const conflictWhere = {
      dayOfWeek: validated.dayOfWeek,
      startTime: validated.startTime,
    };

    // 1. Professor conflict
    const profConflict = await db.assignment.findFirst({
      where: { ...conflictWhere, professorId: validated.professorId },
    });
    if (profConflict) {
      return NextResponse.json({ message: "الأستاذ لديه حصة في نفس الوقت", conflict: "professor" }, { status: 409 });
    }

    // 2. Room conflict
    if (validated.roomId) {
      const roomConflict = await db.assignment.findFirst({
        where: { ...conflictWhere, roomId: validated.roomId },
      });
      if (roomConflict) {
        return NextResponse.json({ message: "القاعة محجوزة في نفس الوقت", conflict: "room" }, { status: 409 });
      }
    }

    // 3. Group conflict
    if (validated.groupId) {
      const groupConflict = await db.assignment.findFirst({
        where: { ...conflictWhere, groupId: validated.groupId },
      });
      if (groupConflict) {
        return NextResponse.json({ message: "المجموعة لديها حصة في نفس الوقت", conflict: "group" }, { status: 409 });
      }
    }

    const assignment = await db.assignment.create({
      data: {
        courseId:    validated.courseId,
        professorId: validated.professorId,
        groupId:     validated.groupId || null,
        roomId:      validated.roomId   || null,
        dayOfWeek:   validated.dayOfWeek,
        startTime:   validated.startTime,
        endTime:     validated.endTime,
        sessionType: validated.sessionType,
        semester:    validated.semester,
        academicYear: validated.academicYear,
        specialization: validated.specialization,
      },
      include: {
        course:    { select: { id: true, name: true, code: true } },
        professor: { select: { id: true, name: true } },
        group:     { select: { id: true, name: true } },
        room:      { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    console.error("POST /api/schedule/sessions error:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
