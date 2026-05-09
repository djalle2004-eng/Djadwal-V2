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
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useCourses, useDeleteCourse } from "@/lib/hooks/use-courses";
import { CourseForm } from "@/components/courses/course-form";
import { useDebounce } from "@/lib/hooks/use-debounce";

const typeColors: Record<string, string> = {
  lecture: "bg-blue-100 text-blue-700 border-blue-200",
  td: "bg-amber-100 text-amber-700 border-amber-200",
  tp: "bg-emerald-100 text-emerald-700 border-emerald-200",
  exam: "bg-purple-100 text-purple-700 border-purple-200",
};

const typeLabels: Record<string, string> = {
  lecture: "محاضرة",
  td: "أعمال موجهة",
  tp: "أعمال تطبيقية",
  exam: "امتحان",
};

export function CoursesClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const deleteMutation = useDeleteCourse();

  const { data: courses = [], isLoading, isFetching } = useCourses({
    search: debouncedSearch,
    type: typeFilter,
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المادة "${name}"؟`)) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "المادة",
      cell: ({ row }) => (
        <div>
          <p className="font-black text-slate-800">{row.original.name}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{row.original.code}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "النوع الأساسي",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge className={`font-black text-[10px] border ${typeColors[type] || "bg-slate-100"}`}>
            {typeLabels[type] || type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "credits",
      header: "الأرصدة / الساعات",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{row.original.credits || "-"} أرصدة</span>
          <span className="text-xs text-slate-400">{row.original.hoursPerWeek} سا/أسبوع</span>
        </div>
      ),
    },
    {
      id: "professors",
      header: "الأساتذة المعينون",
      cell: ({ row }) => {
        const profs = row.original.assignments?.map((a: any) => a.professor.name) || [];
        if (profs.length === 0) return <span className="text-slate-300 text-xs italic">لا يوجد تعيينات</span>;
        
        return (
          <div className="flex flex-wrap gap-1">
            {profs.slice(0, 2).map((p: string, i: number) => (
              <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {p}
              </span>
            ))}
            {profs.length > 2 && (
              <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                +{profs.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => {
        const course = row.original;
        const isDeleting = deletingId === course.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon-sm" className="rounded-xl hover:bg-slate-100">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            } />
            <DropdownMenuContent align="end" className="rounded-2xl w-40">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => { setEditingCourse(course); setFormOpen(true); }}
              >
                <Pencil className="h-4 w-4 text-slate-500" />
                <span>تعديل</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => handleDelete(course.id, course.name)}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-teal-100 p-2 rounded-2xl">
              <BookOpen className="h-7 w-7 text-teal-600" />
            </div>
            إدارة المواد
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            إجمالي {courses.length} مادة دراسية
            {isFetching && <span className="text-teal-500 mr-2 text-xs">جاري التحديث...</span>}
          </p>
        </div>
        <Button
          onClick={() => { setEditingCourse(null); setFormOpen(true); }}
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2 px-6 h-12 rounded-2xl shadow-lg shadow-teal-100 font-black"
        >
          <Plus className="h-5 w-5" />
          إضافة مادة جديدة
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ابحث بالاسم أو الرمز..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 rounded-xl h-10 bg-slate-50 border-slate-200"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v: string | null) => setTypeFilter(v === "all" ? "" : (v || ""))}>
          <SelectTrigger className="w-[180px] rounded-xl h-10 bg-slate-50 border-slate-200">
            <SelectValue placeholder="كل الأنواع" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="lecture">محاضرة</SelectItem>
            <SelectItem value="td">أعمال موجهة</SelectItem>
            <SelectItem value="tp">أعمال تطبيقية</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <DataTable columns={columns} data={courses} searchKey="name" placeholder="ابحث في النتائج..." />
        )}
      </div>

      <CourseForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingCourse(null); }}
        course={editingCourse}
      />
    </>
  );
}
