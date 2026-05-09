import db from "@/lib/db";
import { SchedulePageClient } from "@/components/schedule/schedule-page-client";

export default async function SchedulePage() {
  // Pre-fetch all reference data server-side
  const [groups, professors, rooms, departments, semesters] = await Promise.all([
    db.group.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.professor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.room.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.semester.findMany({ select: { id: true, name: true }, orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="h-full" dir="rtl">
      <SchedulePageClient
        groups={groups}
        professors={professors}
        rooms={rooms}
        departments={departments}
        semesters={semesters}
      />
    </div>
  );
}
