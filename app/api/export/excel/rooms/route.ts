import { NextRequest, NextResponse } from "next/server";
import { exportRoomsToExcel } from "@/lib/services/excel-export";

export async function GET() {
  try {
    const buffer = await exportRoomsToExcel();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="rooms.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "فشل تصدير الملف" }, { status: 500 });
  }
}
