import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const createProfessorSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["PERMANENT", "TEMPORARY"]).default("PERMANENT"),
  departmentId: z.string().optional().or(z.literal("")),
  specialization: z.string().optional(),
  maxHours: z.number().min(0).max(40).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: any = {
    AND: [
      search ? { name: { contains: search, mode: "insensitive" } } : {},
      department ? { departmentId: department } : {},
      type ? { type: type.toLowerCase() } : {},
    ],
  };

  const [professors, total] = await Promise.all([
    db.professor.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { assignments: true, extraSessions: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    db.professor.count({ where }),
  ]);

  return NextResponse.json({
    data: professors,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = createProfessorSchema.parse(body);

    const { firstName, lastName, email, phone, type, departmentId, maxHours } = validated;
    const name = `${firstName} ${lastName}`.trim();

    // Check email uniqueness if provided
    if (email) {
      const existing = await db.professor.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ message: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
      }
    }

    const professor = await db.professor.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        type: type.toLowerCase(),
        departmentId: departmentId || null,
        maxHours: maxHours ?? 18,
        isActive: true,
      },
      include: { department: { select: { id: true, name: true } } },
    });

    return NextResponse.json(professor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    console.error("POST /api/professors error:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
