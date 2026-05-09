import db from "@/lib/db";
import { SchedulePageClient } from "@/components/schedule/schedule-page-client";

export default async function SchedulePage() {
  // Pre-fetch all reference data server-side
  const [groups, professors, rooms, departments, semesters, academicYearsFromDb, assignments] = await Promise.all([
    db.group.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.professor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.room.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.semester.findMany({ select: { id: true, name: true }, orderBy: { startDate: "desc" } }),
    db.academicYear.findMany({ select: { id: true, year: true }, orderBy: { year: "desc" } }),
    db.assignment.findMany({ select: { academicYear: true, semester: true }, distinct: ['academicYear', 'semester'] }),
  ]);

  // Extract unique labels for filters if the formal tables are not populated or don't match
  const uniqueAcademicYears = Array.from(new Set(assignments.map(a => a.academicYear).filter(Boolean))) as string[];
  const uniqueSemesters = Array.from(new Set(assignments.map(a => a.semester).filter(Boolean))) as string[];

  // Fallback to formal tables if no data in assignments yet
  const displayYears = uniqueAcademicYears.length > 0 
    ? uniqueAcademicYears.map(y => ({ id: y, name: y }))
    : academicYearsFromDb.map(y => ({ id: y.year, name: y.year }));

  const displaySemesters = uniqueSemesters.length > 0
    ? uniqueSemesters.map(s => ({ id: s, name: s }))
    : semesters.map(s => ({ id: s.name, name: s.name }));

  return (
    <div className="h-full" dir="rtl">
      <SchedulePageClient
        groups={groups}
        professors={professors}
        rooms={rooms}
        departments={departments}
        semesters={displaySemesters}
        academicYears={displayYears}
      />
    </div>
  );
}
