import { NextRequest, NextResponse } from "next/server";
import { exportProfessorsToExcel } from "@/lib/services/excel-export";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId") || undefined;

  try {
    const filters = departmentId ? { departmentId } : {};
    const buffer = await exportProfessorsToExcel(filters);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="professors.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "فشل تصدير الملف" }, { status: 500 });
  }
}
