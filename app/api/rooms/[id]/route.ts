import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const updateRoomSchema = z.object({
  name: z.string().min(1, "اسم القاعة مطلوب").optional(),
  capacity: z.coerce.number().min(1, "السعة يجب أن تكون أكبر من 0").max(1000, "السعة غير صالحة").optional(),
  type: z.enum(["classroom", "amphitheater", "lab", "computer_lab"]).optional(),
  building: z.string().optional(),
  floor: z.coerce.number().optional(),
  hasProjector: z.boolean().optional(),
  hasComputers: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const room = await db.room.findUnique({
    where: { id },
  });

  if (!room) return NextResponse.json({ message: "القاعة غير موجودة" }, { status: 404 });

  return NextResponse.json(room);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = updateRoomSchema.parse(body);

    const room = await db.room.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(room);
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

  // Check if room is used in assignments
  const assignmentCount = await db.assignment.count({ where: { roomId: id } });
  if (assignmentCount > 0) {
    return NextResponse.json(
      { message: `لا يمكن حذف هذه القاعة لأنها مرتبطة بـ ${assignmentCount} حصة دراسية` },
      { status: 409 }
    );
  }

  await db.room.delete({ where: { id } });
  return NextResponse.json({ message: "تم حذف القاعة بنجاح" });
}
