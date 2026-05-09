import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { auth } from "@/auth";

const roomSchema = z.object({
  name: z.string().min(1, "اسم القاعة مطلوب"),
  capacity: z.coerce.number().min(1, "السعة يجب أن تكون أكبر من 0").max(1000, "السعة غير صالحة"),
  type: z.enum(["classroom", "amphitheater", "lab", "computer_lab"]),
  building: z.string().optional(),
  floor: z.coerce.number().optional(),
  hasProjector: z.boolean().default(false),
  hasComputers: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  const where: any = {
    AND: [
      search ? { name: { contains: search, mode: "insensitive" } } : {},
      type && type !== "all" ? { type: type.toLowerCase() } : {},
    ],
  };

  const rooms = await db.room.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = roomSchema.parse(body);

    const room = await db.room.create({
      data: {
        name: validated.name,
        capacity: validated.capacity,
        type: validated.type,
        building: validated.building,
        floor: validated.floor,
        hasProjector: validated.hasProjector,
        hasComputers: validated.hasComputers,
        isActive: true,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "بيانات غير صالحة", errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
