import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/api-auth";
import db from "@/lib/db";
import { z } from "zod";

const UpdateUserSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "SCHEDULE_MANAGER", "PROFESSOR", "VIEWER", "USER"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Only ADMINs can modify users — requires ADMIN permission
  const { error } = await checkPermission("ADMIN");
  if (error) return error;

  const { userId } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
