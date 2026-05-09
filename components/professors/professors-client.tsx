"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserRound,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useProfessors, useDeleteProfessor } from "@/lib/hooks/use-professors";
import { ProfessorForm } from "@/components/professors/professor-form";
import { ProfessorDrawer } from "@/components/professors/professor-drawer";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface ProfessorsClientProps {
  departments: { id: string; name: string }[];
}

export function ProfessorsClient({ departments }: ProfessorsClientProps) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<any>(null);
  const [drawerProfessorId, setDrawerProfessorId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const deleteMutation = useDeleteProfessor();

  const { data, isLoading, isFetching } = useProfessors({
    search: debouncedSearch,
    department: departmentFilter,
    type: typeFilter,
  });

  const professors = data?.data || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الأستاذ "${name}"؟`)) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "الاسم الكامل",
      cell: ({ row }) => (
        <button
          onClick={() => setDrawerProfessorId(row.original.id)}
          className="font-black text-slate-800 hover:text-blue-600 transition-colors text-right"
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "department",
      header: "القسم",
      cell: ({ row }) => (
        <span className="text-slate-600 font-medium">
          {row.original.department?.name || <span className="text-slate-300 italic text-xs">غير محدد</span>}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "النوع",
      cell: ({ row }) => {
        const isTemp = row.original.type === "temporary";
        return (
          <Badge className={`font-black text-[10px] ${
            isTemp 
              ? "bg-orange-100 text-orange-700 border-orange-200" 
              : "bg-blue-100 text-blue-700 border-blue-200"
          } border`}>
            {isTemp ? "مؤقت" : "دائم"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "_count",
      header: "عدد الحصص",
      cell: ({ row }) => {
        const count = row.original._count?.assignments || 0;
        const maxH = row.original.maxHours || 18;
        const hours = count * 1.5;
        const overloaded = hours > maxH;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-black ${overloaded ? "text-red-600" : "text-slate-700"}`}>
              {count} حصة
            </span>
            {overloaded && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => (
        <Badge className={`text-[10px] font-black border ${
          row.original.isActive 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
          {row.original.isActive ? "نشط" : "غير نشط"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => {
        const prof = row.original;
        const isDeleting = deletingId === prof.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon-sm" className="rounded-xl hover:bg-slate-100">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            } />
            <DropdownMenuContent align="end" className="rounded-2xl w-48">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setDrawerProfessorId(prof.id)}
              >
                <Eye className="h-4 w-4 text-blue-500" />
                <span>عرض عبء العمل</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => { setEditingProfessor(prof); setFormOpen(true); }}
              >
                <Pencil className="h-4 w-4 text-slate-500" />
                <span>تعديل</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => handleDelete(prof.id, prof.name)}
              >
                <Trash2 className="h-4 w-4" />
                <span>حذف</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-2xl">
              <UserRound className="h-7 w-7 text-blue-600" />
            </div>
            إدارة الأساتذة
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            إجمالي {data?.pagination?.total ?? "..."} أستاذ مسجل
            {isFetching && <span className="text-blue-500 mr-2 text-xs">جاري التحديث...</span>}
          </p>
        </div>
        <Button
          onClick={() => { setEditingProfessor(null); setFormOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 h-12 rounded-2xl shadow-lg shadow-blue-100 font-black"
        >
          <Plus className="h-5 w-5" />
          إضافة أستاذ جديد
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ابحث بالاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 rounded-xl h-10 bg-slate-50 border-slate-200"
          />
        </div>
        <Select value={departmentFilter} onValueChange={(v: string | null) => setDepartmentFilter(v === "all" ? "" : (v || ""))}>
          <SelectTrigger className="w-[180px] rounded-xl h-10 bg-slate-50 border-slate-200">
            <SelectValue placeholder="كل الأقسام" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">كل الأقسام</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v: string | null) => setTypeFilter(v === "all" ? "" : (v || ""))}>
          <SelectTrigger className="w-[150px] rounded-xl h-10 bg-slate-50 border-slate-200">
            <SelectValue placeholder="كل الأنواع" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="permanent">دائم</SelectItem>
            <SelectItem value="temporary">مؤقت</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={professors}
            searchKey="name"
            placeholder="ابحث في النتائج..."
          />
        )}
      </div>

      {/* Form Modal */}
      <ProfessorForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingProfessor(null); }}
        departments={departments}
        professor={editingProfessor}
      />

      {/* Workload Drawer */}
      <ProfessorDrawer
        professorId={drawerProfessorId}
        onClose={() => setDrawerProfessorId(null)}
      />
    </>
  );
}
