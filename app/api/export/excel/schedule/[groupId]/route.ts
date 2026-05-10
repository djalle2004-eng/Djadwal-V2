import { NextRequest, NextResponse } from "next/server";
import { exportScheduleToExcel } from "@/lib/services/excel-export";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const { searchParams } = new URL(req.url);
  const semester = searchParams.get("semester") || undefined;

  try {
    const buffer = await exportScheduleToExcel(groupId, semester);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="schedule-${groupId}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "فشل تصدير الملف" }, { status: 500 });
  }
}
