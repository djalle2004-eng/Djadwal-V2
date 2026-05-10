import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/api-auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(["ADMIN", "MANAGER", "SCHEDULE_MANAGER", "PROFESSOR", "VIEWER", "USER"]),
});

export async function POST(req: NextRequest) {
  // Only ADMINs can create users
  const { error } = await checkPermission("ADMIN");
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: "بيانات غير صالحة", 
        details: parsed.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("CREATE_USER_ERROR", err);
    return NextResponse.json({ error: "فشل في إنشاء المستخدم" }, { status: 500 });
  }
}
