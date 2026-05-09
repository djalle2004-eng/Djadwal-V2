"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DAYS, TIME_SLOTS, type ScheduleSession } from "@/lib/types/schedule";
import { SessionCard } from "@/components/schedule/session-card";
import { useMoveSession, useDeleteSession } from "@/lib/hooks/use-schedule";
import { toast } from "sonner";

interface TimetableGridProps {
  sessions: ScheduleSession[];
  conflictSessionIds?: Set<string>;
  onEditSession?: (session: ScheduleSession) => void;
  isLoading?: boolean;
}

// ─── Droppable Cell ──────────────────────────────────────────────────────────
function DroppableCell({
  id,
  children,
  isOver,
  hasSession,
}: {
  id: string;
  children?: React.ReactNode;
  isOver?: boolean;
  hasSession?: boolean;
}) {
  const { setNodeRef, isOver: dndIsOver } = useDroppable({ id });
  const activeIsOver = isOver ?? dndIsOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full min-h-[96px] rounded-xl border-2 border-dashed transition-all duration-200 p-1",
        !hasSession && "border-slate-200 bg-slate-50/30",
        activeIsOver && !hasSession && "border-blue-400 bg-blue-50/50 scale-[1.02] shadow-inner",
        activeIsOver && hasSession && "border-red-400 bg-red-50/50",
      )}
    >
      {children}
    </div>
  );
}

// ─── Draggable Session ────────────────────────────────────────────────────────
function DraggableSession({
  session,
  isConflict,
  onEdit,
  onDelete,
}: {
  session: ScheduleSession;
  isConflict?: boolean;
  onEdit?: (session: ScheduleSession) => void;
  onDelete?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <SessionCard
        session={session}
        isDragging={false}
        isConflict={isConflict}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

// ─── Main Grid ─────────────────────────────────────────────────────────────
export function TimetableGrid({
  sessions,
  conflictSessionIds = new Set(),
  onEditSession,
  isLoading,
}: TimetableGridProps) {
  const [activeSession, setActiveSession] = useState<ScheduleSession | null>(null);
  const [undoStack, setUndoStack] = useState<{ id: string; data: { dayOfWeek: number; startTime: string; endTime: string } }[]>([]);

  const moveMutation = useMoveSession();
  const deleteMutation = useDeleteSession();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ─── Build lookup map for quick cell queries ─────────────────────────
  const sessionMap = new Map<string, ScheduleSession[]>();
  sessions.forEach((s) => {
    const key = `${s.dayOfWeek}-${s.startTime}`;
    if (!sessionMap.has(key)) sessionMap.set(key, []);
    sessionMap.get(key)!.push(s);
  });

  // ─── Undo handler ────────────────────────────────────────────────────
  const handleUndo = useCallback(async () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    try {
      await moveMutation.mutateAsync({ id: last.id, data: last.data });
      setUndoStack((prev) => prev.slice(0, -1));
      toast.info("تم التراجع عن آخر تغيير");
    } catch { }
  }, [undoStack, moveMutation]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") handleUndo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo]);

  // ─── DnD Handlers ────────────────────────────────────────────────────
  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveSession(active.data.current?.session ?? null);
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveSession(null);
    if (!over || !active.data.current) return;

    const session = active.data.current.session as ScheduleSession;
    const [dayStr, timeStr] = (over.id as string).split("__");
    const dayOfWeek = parseInt(dayStr);
    const slot = TIME_SLOTS.find((t) => t.start === timeStr);

    if (!slot || slot.isBreak) return;
    if (session.dayOfWeek === dayOfWeek && session.startTime === slot.start) return; // same cell

    // Save for undo
    setUndoStack((prev) => [
      ...prev.slice(-9),
      { id: session.id, data: { dayOfWeek: session.dayOfWeek, startTime: session.startTime, endTime: session.endTime } },
    ]);

    try {
      await moveMutation.mutateAsync({
        id: session.id,
        data: { dayOfWeek, startTime: slot.start, endTime: slot.end },
      });
    } catch {
      setUndoStack((prev) => prev.slice(0, -1));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الحصة؟")) return;
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} modifiers={[restrictToWindowEdges]}>
      <div className="overflow-x-auto rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 bg-white">
        <table className="w-full border-collapse" style={{ minWidth: "900px" }}>
          {/* Header row */}
          <thead>
            <tr>
              <th className="w-28 p-4 bg-slate-50 border-b border-slate-200 text-right">
                <span className="text-xs font-black text-slate-400 uppercase">الوقت / اليوم</span>
              </th>
              {DAYS.map((day) => (
                <th key={day.id} className="p-4 bg-slate-50 border-b border-slate-200 text-center">
                  <span className="text-sm font-black text-slate-700">{day.label}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {TIME_SLOTS.map((slot) => {
              if (slot.isBreak) {
                return (
                  <tr key={slot.id} className="bg-slate-100/60">
                    <td colSpan={7} className="py-2 px-4 text-center">
                      <div className="flex items-center gap-3 justify-center text-slate-400">
                        <div className="h-px flex-1 bg-slate-300" />
                        <span className="text-xs font-black tracking-widest">🍽️ استراحة — 12:30 إلى 14:00</span>
                        <div className="h-px flex-1 bg-slate-300" />
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                  {/* Time column */}
                  <td className="p-3 border-l border-slate-100 text-right align-top">
                    <div className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
                      {slot.start}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-medium px-2">{slot.end}</div>
                  </td>

                  {/* Day cells */}
                  {DAYS.map((day) => {
                    const cellKey = `${day.id}-${slot.start}`;
                    const cellSessions = sessionMap.get(cellKey) || [];
                    const droppableId = `${day.id}__${slot.start}`;

                    return (
                      <td key={day.id} className="p-2 align-top border-l border-slate-100" style={{ width: "14%" }}>
                        <DroppableCell
                          id={droppableId}
                          hasSession={cellSessions.length > 0}
                        >
                          <div className={cn("flex flex-col gap-1 h-full", cellSessions.length > 1 && "gap-1")}>
                            {cellSessions.map((s) => (
                              <DraggableSession
                                key={s.id}
                                session={s}
                                isConflict={conflictSessionIds.has(s.id)}
                                onEdit={onEditSession}
                                onDelete={handleDelete}
                              />
                            ))}
                          </div>
                        </DroppableCell>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drag overlay */}
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeSession && (
          <div style={{ width: 160, opacity: 0.95 }}>
            <SessionCard session={activeSession} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}