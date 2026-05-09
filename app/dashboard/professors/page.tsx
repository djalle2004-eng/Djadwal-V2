import { ProfessorsClient } from "@/components/professors/professors-client";
import db from "@/lib/db";

export default async function ProfessorsPage() {
  // Pre-fetch departments server-side for the form select
  const departments = await db.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6" dir="rtl">
      <ProfessorsClient departments={departments} />
    </div>
  );
}
