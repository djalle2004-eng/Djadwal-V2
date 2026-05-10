import * as XLSX from "xlsx";
import db from "@/lib/db";

/**
 * Utility to convert JSON data to an Excel buffer
 */
function createExcelBuffer(data: any[], sheetName: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Apply some basic RTL-like column ordering if needed, 
  // though xlsx doesn't support full RTL layout in the community edition easily.
  
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

export async function exportProfessorsToExcel(filters: any = {}) {
  const professors = await db.professor.findMany({
    where: filters,
    include: { department: true },
  });

  const data = professors.map((p) => ({
    "اسم الأستاذ": p.name,
    "البريد الإلكتروني": p.email || "-",
    "الهاتف": p.phone || "-",
    "القسم": p.department?.name || "-",
    "النوع": p.type === "permanent" ? "دائم" : "مؤقت",
    "ساعات العمل القصوى": p.maxHours || "-",
    "الحالة": p.isActive ? "نشط" : "غير نشط",
  }));

  return createExcelBuffer(data, "الأساتذة");
}

export async function exportRoomsToExcel() {
  const rooms = await db.room.findMany();

  const data = rooms.map((r) => ({
    "اسم القاعة": r.name,
    "السعة": r.capacity,
    "النوع": r.type || "-",
    "المبنى": r.building || "-",
    "الطابق": r.floor || "-",
    "جهاز عرض": r.hasProjector ? "نعم" : "لا",
    "حواسيب": r.hasComputers ? "نعم" : "لا",
    "الحالة": r.isActive ? "نشطة" : "غير نشطة",
  }));

  return createExcelBuffer(data, "القاعات");
}

export async function exportAssignmentsToExcel(filters: any = {}) {
  const assignments = await db.assignment.findMany({
    where: filters,
    include: {
      course: true,
      professor: true,
      group: true,
      room: true,
    },
  });

  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const data = assignments.map((a) => ({
    "المادة": a.course?.name,
    "كود المادة": a.course?.code,
    "الأستاذ": a.professor?.name,
    "المجموعة": a.group?.name || "-",
    "القاعة": a.room?.name || "-",
    "اليوم": days[a.dayOfWeek] || a.dayOfWeek,
    "وقت البداية": a.startTime,
    "وقت النهاية": a.endTime,
    "نوع الحصة": a.sessionType || "lecture",
    "الفصل الدراسي": a.semester || "-",
  }));

  return createExcelBuffer(data, "التوزيعات");
}

export async function exportWorkloadReport(semesterId?: string) {
  // Logic to calculate hours per professor
  // For simplicity, we fetch all assignments and sum the hours.
  // Note: Calculation might need more complex logic for actual hours.
  const assignments = await db.assignment.findMany({
    include: { professor: true },
  });

  const workloadMap: Record<string, { name: string; hours: number; count: number }> = {};

  assignments.forEach((a) => {
    if (!a.professorId) return;
    if (!workloadMap[a.professorId]) {
      workloadMap[a.professorId] = { name: a.professor.name, hours: 0, count: 0 };
    }
    
    // Calculate duration in hours (e.g. 08:00 to 09:30 = 1.5h)
    const [h1, m1] = a.startTime.split(":").map(Number);
    const [h2, m2] = a.endTime.split(":").map(Number);
    const duration = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
    
    workloadMap[a.professorId].hours += duration;
    workloadMap[a.professorId].count += 1;
  });

  const data = Object.values(workloadMap).map((w) => ({
    "الأستاذ": w.name,
    "عدد الحصص": w.count,
    "إجمالي الساعات": w.hours.toFixed(2),
  }));

  return createExcelBuffer(data, "تقرير العبء الساعي");
}

export async function exportScheduleToExcel(groupId: string, semester?: string) {
  const assignments = await db.assignment.findMany({
    where: { groupId, semester },
    include: {
      course: true,
      professor: true,
      room: true,
    },
  });

  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const times = ["08:00", "09:30", "11:00", "13:00", "14:30", "16:00"];

  // Create a grid-like structure for the Excel sheet
  const grid: any[] = [];
  
  // Header row: Times
  const header = ["اليوم / الوقت", ...times];
  grid.push(header);

  days.forEach((day, dayIdx) => {
    const row = [day];
    times.forEach((time) => {
      const match = assignments.find((a) => a.dayOfWeek === dayIdx && a.startTime === time);
      if (match) {
        row.push(`${match.course?.name}\n(${match.professor?.name})\n${match.room?.name || ""}`);
      } else {
        row.push("");
      }
    });
    grid.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(grid);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الجدول الأسبوعي");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
