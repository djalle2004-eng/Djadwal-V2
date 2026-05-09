import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const updateCourseSchema = z.object({
  name: z.string().min(1, "اسم المادة مطلوب").optional(),
  code: z.string().min(1, "رمز المادة مطلوب").optional(),
  type: z.enum(["lecture", "td", "tp", "exam"]).optional(),
  credits: z.coerce.number().min(1).optional(),
  description: z.string().optional(),
  hoursPerWeek: z.coerce.number().min(0.5).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
  });

  if (!course) return NextResponse.json({ message: "المادة غير موجودة" }, { status: 404 });

  return NextResponse.json(course);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = updateCourseSchema.parse(body);

    if (validated.code) {
      const existing = await db.course.findFirst({
        where: { code: validated.code, NOT: { id } }
      });
      if (existing) {
        return NextResponse.json({ message: "رمز المادة مستخدم بالفعل" }, { status: 409 });
      }
    }

    const course = await db.course.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(course);
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

  // Check if course is used in assignments
  const assignmentCount = await db.assignment.count({ where: { courseId: id } });
  if (assignmentCount > 0) {
    return NextResponse.json(
      { message: `لا يمكن حذف هذه المادة لأنها مرتبطة بـ ${assignmentCount} حصة دراسية` },
      { status: 409 }
    );
  }

  await db.course.delete({ where: { id } });
  return NextResponse.json({ message: "تم حذف المادة بنجاح" });
}
