import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Plus, UserRound } from "lucide-react";
import db from "@/lib/db";

const columns = [
  {
    accessorKey: "name",
    header: "الاسم الكامل",
  },
  {
    accessorKey: "email",
    header: "البريد الإلكتروني",
  },
  {
    accessorKey: "type",
    header: "النوع",
  },
  {
    accessorKey: "department",
    header: "القسم",
    cell: ({ row }: any) => row.original.department?.name || "غير محدد",
  },
];

export default async function ProfessorsPage() {
  const professors = await db.professor.findMany({
    include: { department: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <UserRound className="h-8 w-8 text-blue-600" />
            إدارة الأساتذة
          </h1>
          <p className="text-slate-500 font-medium mt-1">إدارة وتوزيع الساعات التدريسية للطاقم البيداغوجي</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 py-6 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus className="h-5 w-5" />
          <span className="font-bold">أضف أستاذ جديد</span>
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100">
        <DataTable 
          columns={columns} 
          data={professors} 
          searchKey="name" 
          placeholder="ابحث عن أستاذ بالاسم..."
        />
      </div>
    </div>
  );
}
