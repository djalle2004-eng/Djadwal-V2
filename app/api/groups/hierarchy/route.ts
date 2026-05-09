import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const departments = await db.department.findMany({
    include: {
      specializations: {
        include: {
          groups: true,
        },
      },
      groups: {
        where: { specializationId: null }, // Groups directly under department
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(departments);
}
