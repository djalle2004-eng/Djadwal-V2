import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let settings = await db.printSettings.findFirst();
  if (!settings) {
    settings = await db.printSettings.create({
      data: {
        universityName: "جامعة الجزائر",
        facultyName: "كلية العلوم والتكنولوجيا",
      }
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    let settings = await db.printSettings.findFirst();
    
    if (settings) {
      settings = await db.printSettings.update({
        where: { id: settings.id },
        data: {
          universityName: body.universityName,
          facultyName: body.facultyName,
          universityLogo: body.universityLogo,
          facultyLogo: body.facultyLogo,
          headerNotes: body.headerNotes,
          footerNotes: body.footerNotes,
          examNotes: body.examNotes,
        },
      });
    } else {
      settings = await db.printSettings.create({
        data: body,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: "خطأ في حفظ الإعدادات" }, { status: 500 });
  }
}
