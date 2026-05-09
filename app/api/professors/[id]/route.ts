import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const updateProfessorSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["PERMANENT", "TEMPORARY"]).optional(),
  departmentId: z.string().optional().or(z.literal("")),
  maxHours: z.number().min(0).max(40).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const professor = await db.professor.findUnique({
    where: { id },
    include: {
      department: true,
      assignments: {
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          sessionType: true,
          course: { select: { name: true, code: true } },
          room: { select: { name: true } },
          group: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      _count: { select: { assignments: true, extraSessions: true } },
    },
  });

  if (!professor) {
    return NextResponse.json({ message: "الأستاذ غير موجود" }, { status: 404 });
  }

  return NextResponse.json(professor);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const validated = updateProfessorSchema.parse(body);
    const { firstName, lastName, ...rest } = validated;

    // Build name update if first/last provided
    let nameUpdate = {};
    if (firstName || lastName) {
      const current = await db.professor.findUnique({ where: { id }, select: { name: true } });
      const parts = current?.name?.split(" ") || ["", ""];
      const newFirst = firstName || parts[0];
      const newLast = lastName || parts.slice(1).join(" ") || parts[0];
      nameUpdate = { name: `${newFirst} ${newLast}`.trim() };
    }

    const professor = await db.professor.update({
      where: { id },
      data: {
        ...nameUpdate,
        email: rest.email || null,
        phone: rest.phone,
        type: rest.type?.toLowerCase(),
        departmentId: rest.departmentId || null,
        maxHours: rest.maxHours,
        isActive: rest.isActive,
      },
      include: { department: { select: { id: true, name: true } } },
    });

    return NextResponse.json(professor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check for linked assignments
  const assignmentCount = await db.assignment.count({ where: { professorId: id } });
  if (assignmentCount > 0) {
    return NextResponse.json(
      { message: `لا يمكن حذف هذا الأستاذ لأنه مرتبط بـ ${assignmentCount} حصة دراسية` },
      { status: 409 }
    );
  }

  await db.professor.delete({ where: { id } });
  return NextResponse.json({ message: "تم حذف الأستاذ بنجاح" });
}
