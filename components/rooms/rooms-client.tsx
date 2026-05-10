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
  DoorOpen,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Monitor,
  Projector,
  FileSpreadsheet,
} from "lucide-react";
import { useRooms, useDeleteRoom } from "@/lib/hooks/use-rooms";
import { RoomForm } from "@/components/rooms/room-form";
import { useDebounce } from "@/lib/hooks/use-debounce";

const typeColors: Record<string, string> = {
  classroom: "bg-blue-100 text-blue-700 border-blue-200",
  amphitheater: "bg-purple-100 text-purple-700 border-purple-200",
  lab: "bg-emerald-100 text-emerald-700 border-emerald-200",
  computer_lab: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const typeLabels: Record<string, string> = {
  classroom: "قاعة تدريس",
  amphitheater: "مدرج",
  lab: "مخبر",
  computer_lab: "مخبر إعلام آلي",
};

export function RoomsClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const deleteMutation = useDeleteRoom();

  const { data: rooms = [], isLoading, isFetching } = useRooms({
    search: debouncedSearch,
    type: typeFilter,
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف القاعة "${name}"؟`)) return;
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
      header: "الاسم",
      cell: ({ row }) => (
        <span className="font-black text-slate-800">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "النوع",
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
      accessorKey: "capacity",
      header: "السعة",
      cell: ({ row }) => (
        <span className="font-bold text-slate-600">{row.original.capacity} طالب</span>
      ),
    },
    {
      id: "equipment",
      header: "المعدات",
      cell: ({ row }) => (
        <div className="flex gap-2 text-slate-400">
          {row.original.hasProjector && <Projector className="h-4 w-4 text-blue-500" />}
          {row.original.hasComputers && <Monitor className="h-4 w-4 text-emerald-500" />}
          {!row.original.hasProjector && !row.original.hasComputers && <span className="text-xs text-slate-300">لا يوجد</span>}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => (
        <Badge className={`text-[10px] font-black border ${
          row.original.isActive 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {row.original.isActive ? "متاحة" : "غير متاحة"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => {
        const room = row.original;
        const isDeleting = deletingId === room.id;
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
                onClick={() => { setEditingRoom(room); setFormOpen(true); }}
              >
                <Pencil className="h-4 w-4 text-slate-500" />
                <span>تعديل</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => handleDelete(room.id, room.name)}
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
            <div className="bg-indigo-100 p-2 rounded-2xl">
              <DoorOpen className="h-7 w-7 text-indigo-600" />
            </div>
            إدارة القاعات
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            إجمالي {rooms.length} قاعة مسجلة
            {isFetching && <span className="text-indigo-500 mr-2 text-xs">جاري التحديث...</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open("/api/export/excel/rooms", "_blank")}
            className="rounded-2xl h-12 gap-2 border-slate-200 text-slate-600 font-black shadow-sm bg-white"
          >
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            تصدير Excel
          </Button>
          <Button
            onClick={() => { setEditingRoom(null); setFormOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6 h-12 rounded-2xl shadow-lg shadow-indigo-100 font-black"
          >
            <Plus className="h-5 w-5" />
            إضافة قاعة جديدة
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ابحث باسم القاعة..."
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
            <SelectItem value="classroom">قاعة تدريس</SelectItem>
            <SelectItem value="amphitheater">مدرج</SelectItem>
            <SelectItem value="lab">مخبر</SelectItem>
            <SelectItem value="computer_lab">مخبر إعلام آلي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <DataTable columns={columns} data={rooms} searchKey="name" placeholder="ابحث في النتائج..." />
        )}
      </div>

      <RoomForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingRoom(null); }}
        room={editingRoom}
      />
    </>
  );
}
