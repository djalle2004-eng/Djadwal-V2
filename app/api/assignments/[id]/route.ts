import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const assignmentSchema = z.object({
  courseId: z.string().min(1).optional(),
  professorId: z.string().min(1).optional(),
  groupId: z.string().optional().or(z.literal("")),
  roomId: z.string().optional().or(z.literal("")),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  sessionType: z.string().optional(),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
  specialization: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = assignmentSchema.parse(body);

    const assignment = await db.assignment.update({
      where: { id },
      data: validated,
      include: {
        course: true,
        professor: true,
        group: true,
        room: true,
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await db.assignment.delete({
      where: { id }
    });
    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch (error) {
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
