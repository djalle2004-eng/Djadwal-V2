import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const groupSchema = z.object({
  name: z.string().min(1, "اسم المجموعة مطلوب"),
  size: z.coerce.number().min(1, "عدد الطلاب يجب أن يكون أكبر من 0").max(500),
  departmentId: z.string().optional().or(z.literal("")),
  specializationId: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = groupSchema.parse(body);

    const group = await db.group.create({
      data: {
        name: validated.name,
        size: validated.size,
        departmentId: validated.departmentId || null,
        specializationId: validated.specializationId || null,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
