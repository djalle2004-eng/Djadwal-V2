import { NextRequest, NextResponse } from "next/server";
import { exportWorkloadReport } from "@/lib/services/excel-export";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get("semesterId") || undefined;

  try {
    const buffer = await exportWorkloadReport(semesterId);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="workload-report.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "فشل تصدير الملف" }, { status: 500 });
  }
}
