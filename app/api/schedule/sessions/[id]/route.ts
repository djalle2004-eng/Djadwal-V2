import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const moveSchema = z.object({
  dayOfWeek:  z.number().min(1).max(6),
  startTime:  z.string().regex(/^\d{2}:\d{2}$/),
  endTime:    z.string().regex(/^\d{2}:\d{2}$/),
  roomId:     z.string().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = moveSchema.parse(body);

    // Fetch the original session for conflict checks
    const original = await db.assignment.findUnique({ where: { id } });
    if (!original) return NextResponse.json({ message: "الحصة غير موجودة" }, { status: 404 });

    const conflictWhere = {
      dayOfWeek: validated.dayOfWeek,
      startTime: validated.startTime,
      NOT: { id }, // Exclude self
    };

    // Professor conflict
    const profConflict = await db.assignment.findFirst({
      where: { ...conflictWhere, professorId: original.professorId },
    });
    if (profConflict) {
      return NextResponse.json({ message: "الأستاذ لديه حصة في نفس الوقت", conflict: "professor" }, { status: 409 });
    }

    // Room conflict
    const roomId = validated.roomId || original.roomId;
    if (roomId) {
      const roomConflict = await db.assignment.findFirst({
        where: { ...conflictWhere, roomId },
      });
      if (roomConflict) {
        return NextResponse.json({ message: "القاعة محجوزة في نفس الوقت", conflict: "room" }, { status: 409 });
      }
    }

    // Group conflict
    if (original.groupId) {
      const groupConflict = await db.assignment.findFirst({
        where: { ...conflictWhere, groupId: original.groupId },
      });
      if (groupConflict) {
        return NextResponse.json({ message: "المجموعة لديها حصة في نفس الوقت", conflict: "group" }, { status: 409 });
      }
    }

    const updated = await db.assignment.update({
      where: { id },
      data: {
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime:   validated.endTime,
        roomId:    validated.roomId || original.roomId,
      },
      include: {
        course:    { select: { id: true, name: true, code: true } },
        professor: { select: { id: true, name: true } },
        group:     { select: { id: true, name: true } },
        room:      { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  await db.assignment.delete({ where: { id } });
  return NextResponse.json({ message: "تم حذف الحصة بنجاح" });
}
