"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  SESSION_COLORS,
  SESSION_TYPE_LABELS,
  type ScheduleSession,
} from "@/lib/types/schedule";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoveRight, BookOpen, UserRound, DoorOpen, Users2 } from "lucide-react";

interface SessionCardProps {
  session: ScheduleSession;
  isDragging?: boolean;
  isConflict?: boolean;
  onEdit?: (session: ScheduleSession) => void;
  onDelete?: (id: string) => void;
}

export function SessionCard({
  session,
  isDragging,
  isConflict,
  onEdit,
  onDelete,
}: SessionCardProps) {
  const [showActions, setShowActions] = useState(false);
  const type = (session.sessionType || "lecture") as string;
  const colors = SESSION_COLORS[type] || SESSION_COLORS.lecture;

  return (
    <div
      className={cn(
        "relative group/card rounded-2xl border-2 p-2.5 cursor-grab active:cursor-grabbing h-full min-h-[90px] flex flex-col justify-between transition-all duration-200",
        colors.bg,
        colors.border,
        isDragging && "rotate-1 scale-105 shadow-2xl opacity-90 ring-4 ring-blue-400",
        isConflict && "border-red-400 bg-red-50 ring-2 ring-red-300 ring-offset-1",
        !isDragging && "hover:shadow-lg hover:scale-[1.02]"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white",
          colors.badge
        )}>
          {SESSION_TYPE_LABELS[type] || type}
        </span>
        {isConflict && (
          <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
            ⚠️ تعارض
          </span>
        )}
      </div>

      {/* Course name */}
      <p className={cn("text-xs font-black leading-tight mb-1 truncate", colors.text)}>
        {session.course?.name || "مادة غير محددة"}
      </p>

      {/* Meta info */}
      <div className="space-y-0.5">
        {session.professor && (
          <p className="text-[10px] font-bold text-slate-500 truncate flex items-center gap-1">
            <UserRound className="h-2.5 w-2.5 shrink-0" />
            {session.professor.name}
          </p>
        )}
        {session.room && (
          <p className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1">
            <DoorOpen className="h-2.5 w-2.5 shrink-0" />
            {session.room.name}
          </p>
        )}
        {session.group && (
          <p className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1">
            <Users2 className="h-2.5 w-2.5 shrink-0" />
            {session.group.name}
          </p>
        )}
      </div>

      {/* Action overlay on hover */}
      {showActions && (onEdit || onDelete) && (
        <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm animate-in fade-in duration-150">
          {onEdit && (
            <Button
              size="icon-sm"
              variant="secondary"
              className="h-7 w-7 rounded-xl bg-white shadow-lg hover:bg-blue-50"
              onClick={(e) => { e.stopPropagation(); onEdit(session); }}
            >
              <Pencil className="h-3.5 w-3.5 text-blue-600" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon-sm"
              variant="secondary"
              className="h-7 w-7 rounded-xl bg-white shadow-lg hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}