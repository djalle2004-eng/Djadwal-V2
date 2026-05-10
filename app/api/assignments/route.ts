import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { checkPermission } from "@/lib/api-auth";

const assignmentSchema = z.object({
  courseId: z.string().min(1, "المادة مطلوبة"),
  professorId: z.string().min(1, "الأستاذ مطلوب"),
  groupId: z.string().optional().or(z.literal("")),
  roomId: z.string().optional().or(z.literal("")),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  sessionType: z.string().default("lecture"),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
  specialization: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error } = await checkPermission("READ");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get("specialization");
  const professorId = searchParams.get("professorId");
  const courseId = searchParams.get("courseId");
  const dayOfWeek = searchParams.get("dayOfWeek");

  const where: any = {};
  if (specialization) where.specialization = specialization;
  if (professorId) where.professorId = professorId;
  if (courseId) where.courseId = courseId;
  if (dayOfWeek) where.dayOfWeek = parseInt(dayOfWeek, 10);

  const assignments = await db.assignment.findMany({
    where,
    include: {
      course: true,
      professor: true,
      group: true,
      room: true,
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const { error } = await checkPermission("WRITE");
  if (error) return error;

  try {
    const body = await req.json();
    const validated = assignmentSchema.parse(body);

    const assignment = await db.assignment.create({
      data: validated,
      include: {
        course: true,
        professor: true,
        group: true,
        room: true,
      }
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
