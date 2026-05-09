import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const updateGroupSchema = z.object({
  name: z.string().min(1, "اسم المجموعة مطلوب").optional(),
  size: z.coerce.number().min(1).max(500).optional(),
  departmentId: z.string().optional().or(z.literal("").transform(() => null)),
  specializationId: z.string().optional().or(z.literal("").transform(() => null)),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = updateGroupSchema.parse(body);

    const group = await db.group.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(group);
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

  // Check if group is used in assignments
  const assignmentCount = await db.assignment.count({ where: { groupId: id } });
  if (assignmentCount > 0) {
    return NextResponse.json(
      { message: `لا يمكن حذف هذه المجموعة لأنها مرتبطة بـ ${assignmentCount} حصة دراسية` },
      { status: 409 }
    );
  }

  await db.group.delete({ where: { id } });
  return NextResponse.json({ message: "تم حذف المجموعة بنجاح" });
}
