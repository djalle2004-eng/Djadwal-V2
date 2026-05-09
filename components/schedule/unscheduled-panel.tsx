"use client";

import { useState } from "react";
import { Search, BookOpen, GripVertical, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { SESSION_COLORS, SESSION_TYPE_LABELS, type ScheduleSession } from "@/lib/types/schedule";

interface UnscheduledPanelProps {
  allSessions: ScheduleSession[];
  scheduledIds: Set<string>;
  isLoading?: boolean;
}

function UnscheduledItem({ session }: { session: ScheduleSession }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `unscheduled-${session.id}`,
    data: { session },
  });

  const type = session.sessionType || "lecture";
  const colors = SESSION_COLORS[type] || SESSION_COLORS.lecture;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all",
        colors.bg,
        colors.border,
        isDragging && "shadow-xl scale-105"
      )}
    >
      <GripVertical className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-black truncate", colors.text)}>{session.course?.name}</p>
        <p className="text-[10px] text-slate-500 truncate">{session.professor?.name}</p>
      </div>
      <Badge className={cn("text-[9px] font-black text-white shrink-0", colors.badge)}>
        {SESSION_TYPE_LABELS[type]}
      </Badge>
    </div>
  );
}

export function UnscheduledPanel({ allSessions, scheduledIds, isLoading }: UnscheduledPanelProps) {
  const [search, setSearch] = useState("");

  const unscheduled = allSessions.filter((s) => !scheduledIds.has(s.id));

  const filtered = unscheduled.filter((s) =>
    !search ||
    s.course?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.professor?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          الحصص غير المجدولة
          <Badge className="bg-blue-600 text-white text-[10px] font-black">{unscheduled.length}</Badge>
        </h3>
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-8 h-8 rounded-xl text-sm bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <BookOpen className="h-8 w-8 mx-auto opacity-20 mb-2" />
            <p className="text-xs font-bold">
              {unscheduled.length === 0 ? "جميع الحصص مجدولة ✅" : "لا توجد نتائج"}
            </p>
          </div>
        ) : (
          filtered.map((s) => <UnscheduledItem key={s.id} session={s} />)
        )}
      </div>
    </div>
  );
}
