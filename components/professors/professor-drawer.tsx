"use client";

import { useProfessor } from "@/lib/hooks/use-professors";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  BookOpen, 
  Calendar, 
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface ProfessorDrawerProps {
  professorId: string | null;
  onClose: () => void;
}

const dayNames: Record<number, string> = {
  1: "السبت", 2: "الأحد", 3: "الاثنين",
  4: "الثلاثاء", 5: "الأربعاء", 6: "الخميس",
};

const sessionTypeLabels: Record<string, string> = {
  lecture: "محاضرة",
  td: "أعمال موجهة",
  tp: "أعمال تطبيقية",
};

const sessionTypeColors: Record<string, string> = {
  lecture: "bg-blue-100 text-blue-700",
  td: "bg-emerald-100 text-emerald-700",
  tp: "bg-amber-100 text-amber-700",
};

export function ProfessorDrawer({ professorId, onClose }: ProfessorDrawerProps) {
  const { data: professor, isLoading } = useProfessor(professorId || "");

  const totalHours = professor?._count?.assignments * 1.5 || 0;
  const maxHours = professor?.maxHours || 18;
  const usagePercent = Math.min((totalHours / maxHours) * 100, 100);

  const workloadColor =
    usagePercent >= 90 ? "bg-red-500" :
    usagePercent >= 70 ? "bg-amber-500" :
    "bg-emerald-500";

  const workloadTextColor =
    usagePercent >= 90 ? "text-red-600" :
    usagePercent >= 70 ? "text-amber-600" :
    "text-emerald-600";

  const WorkloadIcon =
    usagePercent >= 90 ? AlertTriangle :
    usagePercent >= 70 ? TrendingUp :
    CheckCircle;

  // Group assignments by day
  const assignmentsByDay = professor?.assignments?.reduce((acc: any, a: any) => {
    const day = a.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(a);
    return acc;
  }, {}) || {};

  return (
    <Sheet open={!!professorId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-hidden" dir="rtl">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : professor ? (
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-bl from-blue-600 to-indigo-700 p-6 text-white">
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black shadow-lg">
                    {professor.name?.charAt(0)}
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-black text-white">{professor.name}</SheetTitle>
                    <SheetDescription className="text-blue-100 text-sm">
                      {professor.department?.name || "بدون قسم"}
                    </SheetDescription>
                    <div className="mt-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                        professor.type === "temporary" 
                          ? "bg-orange-400/30 text-orange-100" 
                          : "bg-blue-400/30 text-blue-100"
                      }`}>
                        {professor.type === "temporary" ? "أستاذ مؤقت" : "أستاذ دائم"}
                      </span>
                    </div>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Workload Section */}
            <div className="p-6 border-b">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <WorkloadIcon className={`h-5 w-5 ${workloadTextColor}`} />
                تقرير عبء العمل
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-slate-900">{professor._count?.assignments || 0}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">حصة أسبوعية</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-slate-900">{totalHours.toFixed(1)}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">ساعة حالياً</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-slate-900">{maxHours}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">الحد الأقصى</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-500 uppercase">نسبة الاستهلاك</span>
                  <span className={`text-sm font-black ${workloadTextColor}`}>{usagePercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${workloadColor}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-400">
                  {usagePercent >= 90 ? "⚠️ تجاوز الحد الأقصى تقريباً" :
                   usagePercent >= 70 ? "⚡ عبء عمل مرتفع" :
                   "✅ ضمن الحد المقبول"}
                </p>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="p-6 flex-1">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                الجدول الأسبوعي
              </h3>

              {Object.keys(assignmentsByDay).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <BookOpen className="h-10 w-10 mx-auto opacity-20 mb-2" />
                  <p className="font-bold">لا توجد حصص مجدولة بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((day) => {
                    const dayAssignments = assignmentsByDay[day];
                    if (!dayAssignments?.length) return null;
                    return (
                      <div key={day}>
                        <div className="text-xs font-black text-slate-500 uppercase mb-2 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{dayNames[day]}</span>
                          <span className="text-slate-300">────</span>
                          <span>{dayAssignments.length} حصة</span>
                        </div>
                        <div className="space-y-2">
                          {dayAssignments.map((a: any) => (
                            <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex flex-col items-center text-center min-w-[52px]">
                                <span className="text-xs font-black text-slate-700">{a.startTime}</span>
                                <span className="text-[10px] text-slate-400">—</span>
                                <span className="text-xs font-black text-slate-700">{a.endTime}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">{a.course?.name}</p>
                                <p className="text-xs text-slate-500">
                                  {a.group?.name} · {a.room?.name}
                                </p>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${sessionTypeColors[a.sessionType] || "bg-slate-100 text-slate-600"}`}>
                                {sessionTypeLabels[a.sessionType] || a.sessionType}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
