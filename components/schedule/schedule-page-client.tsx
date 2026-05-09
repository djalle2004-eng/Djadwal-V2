"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimetableGrid } from "@/components/schedule/timetable-grid";
import { UnscheduledPanel } from "@/components/schedule/unscheduled-panel";
import { useSchedule, useConflicts } from "@/lib/hooks/use-schedule";
import {
  CalendarDays,
  AlertTriangle,
  Eye,
  ChevronRight,
  Undo2,
  Printer,
} from "lucide-react";
import { VIEW_MODE_LABELS, type ViewMode, type ScheduleFilters } from "@/lib/types/schedule";
import { cn } from "@/lib/utils";

interface SchedulePageClientProps {
  groups: { id: string; name: string }[];
  professors: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  semesters: { id: string; name: string }[];
  academicYears: { id: string; name: string }[];
}

export function SchedulePageClient({
  groups,
  professors,
  rooms,
  departments,
  semesters,
  academicYears,
}: SchedulePageClientProps) {
  const [filters, setFilters] = useState<ScheduleFilters>({
    viewMode: "group",
    entityId: groups[0]?.id || "",
    semester: semesters[0]?.id || "",
    academicYear: academicYears[0]?.id || "",
    showConflicts: true,
    showEmpty: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: sessions = [], isLoading } = useSchedule({
    viewMode: filters.viewMode,
    entityId: filters.entityId,
    semester: filters.semester,
    academicYear: filters.academicYear,
  });

  const { data: conflictsData } = useConflicts({
    semester: filters.semester,
    academicYear: filters.academicYear
  });
  const conflictSessionIds = new Set<string>(
    conflictsData?.conflicts?.flatMap((c: any) => c.sessions) ?? []
  );
  const conflictCount = conflictsData?.total ?? 0;

  const entityOptions = {
    group:      groups,
    professor:  professors,
    room:       rooms,
    department: departments,
  }[filters.viewMode];

  return (
    <div className="flex flex-col h-full gap-4 p-6" dir="rtl">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-2xl">
              <CalendarDays className="h-7 w-7 text-blue-600" />
            </div>
            الجدول الدراسي التفاعلي
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            اسحب وأفلت الحصص لإعادة الجدولة · Ctrl+Z للتراجع
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {conflictCount > 0 && (
            <Badge className="bg-red-100 text-red-700 border border-red-200 font-black gap-1.5 px-3 py-1.5 rounded-xl animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              {conflictCount} تعارض
            </Badge>
          )}
          <Button variant="outline" className="rounded-2xl gap-2 font-bold" size="sm">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      {/* ─── Filters Row ─── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        {/* View Mode */}
        <Select
          value={filters.viewMode}
          onValueChange={(v: string | null) => {
            const mode = (v || "group") as ViewMode;
            const first = (mode === "group" ? groups : mode === "professor" ? professors : mode === "room" ? rooms : departments)[0];
            setFilters((f) => ({ ...f, viewMode: mode, entityId: first?.id || "" }));
          }}
        >
          <SelectTrigger className="w-[160px] rounded-xl h-10">
            <Eye className="h-4 w-4 text-slate-400 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {(["group", "professor", "room", "department"] as ViewMode[]).map((m) => (
              <SelectItem key={m} value={m}>{VIEW_MODE_LABELS[m]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Entity selector */}
        <Select
          value={filters.entityId}
          onValueChange={(v: string | null) => setFilters((f) => ({ ...f, entityId: v || "" }))}
        >
          <SelectTrigger className="w-[220px] rounded-xl h-10">
            <SelectValue placeholder={`اختر ${VIEW_MODE_LABELS[filters.viewMode]}`} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {entityOptions.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Academic Year selector */}
        {academicYears.length > 0 && (
          <Select
            value={filters.academicYear || ""}
            onValueChange={(v: string | null) => setFilters((f) => ({ ...f, academicYear: v || "" }))}
          >
            <SelectTrigger className="w-[180px] rounded-xl h-10">
              <SelectValue placeholder="السنة الدراسية" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {academicYears.map((y) => (
                <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Semester selector */}
        {semesters.length > 0 && (
          <Select
            value={filters.semester || ""}
            onValueChange={(v: string | null) => setFilters((f) => ({ ...f, semester: v || "" }))}
          >
            <SelectTrigger className="w-[180px] rounded-xl h-10">
              <SelectValue placeholder="الفصل الدراسي" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex gap-2 mr-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn("rounded-xl gap-2 font-bold", sidebarOpen && "bg-blue-50 text-blue-600 border-blue-200")}
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
            لوحة الحصص
          </Button>
        </div>
      </div>

      {/* ─── Main Area ─── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Grid */}
        <div className={cn("flex-1 min-w-0 transition-all", sidebarOpen && "max-w-[calc(100%-17rem)]")}>
          <TimetableGrid
            sessions={sessions}
            conflictSessionIds={conflictSessionIds}
            onEditSession={() => {}} // TODO: Wire up session edit form
            isLoading={isLoading}
          />
        </div>

        {/* Sidebar Panel */}
        {sidebarOpen && (
          <div className="w-64 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
            <UnscheduledPanel
              allSessions={[]}
              scheduledIds={new Set(sessions.map((s: any) => s.id))}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* ─── Keyboard hint ─── */}
      <div className="flex gap-4 text-[11px] text-slate-400 font-bold">
        <span>🖱️ اسحب الحصص بين الخلايا لتغيير الموعد</span>
        <span>⌨️ Ctrl+Z — التراجع عن آخر تغيير</span>
        <span>🟥 الخلايا الحمراء — تعارض في الجدول</span>
      </div>
    </div>
  );
}
