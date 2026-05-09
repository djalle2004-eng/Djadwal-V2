import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const courseSchema = z.object({
  name: z.string().min(1, "اسم المادة مطلوب"),
  code: z.string().min(1, "رمز المادة مطلوب"),
  type: z.enum(["lecture", "td", "tp", "exam"]).default("lecture"),
  credits: z.coerce.number().min(1).optional(),
  description: z.string().optional(),
  hoursPerWeek: z.coerce.number().min(0.5).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  const where: any = {
    AND: [
      search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ]
      } : {},
      type && type !== "all" ? { type: type.toLowerCase() } : {},
    ],
  };

  const courses = await db.course.findMany({
    where,
    include: {
      assignments: {
        select: {
          professor: { select: { id: true, name: true } }
        },
        distinct: ['professorId'],
      }
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = courseSchema.parse(body);

    const existing = await db.course.findUnique({ where: { code: validated.code } });
    if (existing) {
      return NextResponse.json({ message: "رمز المادة مستخدم بالفعل" }, { status: 409 });
    }

    const course = await db.course.create({
      data: {
        name: validated.name,
        code: validated.code,
        type: validated.type,
        credits: validated.credits,
        description: validated.description,
        hoursPerWeek: validated.hoursPerWeek,
        isActive: true,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
