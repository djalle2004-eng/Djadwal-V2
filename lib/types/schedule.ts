// Types shared across the schedule module

export type SessionType = "lecture" | "td" | "tp" | "exam";
export type ViewMode = "group" | "professor" | "room" | "department";

export interface ScheduleSession {
  id: string;
  courseId: string;
  professorId: string;
  groupId?: string | null;
  roomId?: string | null;
  dayOfWeek: number;       // 1=Saturday … 6=Thursday
  startTime: string;       // "08:00"
  endTime: string;         // "09:30"
  sessionType: string;
  academicYear?: string | null;
  semester?: string | null;
  specialization?: string | null;
  // Joined relations:
  course?: { id: string; name: string; code: string };
  professor?: { id: string; name: string };
  group?: { id: string; name: string } | null;
  room?: { id: string; name: string } | null;
}

export interface ScheduleFilters {
  viewMode: ViewMode;
  entityId: string;
  semesterId?: string;
  showConflicts: boolean;
  showEmpty: boolean;
}

export const DAYS = [
  { id: 1, label: "السبت" },
  { id: 2, label: "الأحد" },
  { id: 3, label: "الاثنين" },
  { id: 4, label: "الثلاثاء" },
  { id: 5, label: "الأربعاء" },
  { id: 6, label: "الخميس" },
];

export const TIME_SLOTS = [
  { id: "08:00-09:30", start: "08:00", end: "09:30", label: "08:00 - 09:30" },
  { id: "09:30-11:00", start: "09:30", end: "11:00", label: "09:30 - 11:00" },
  { id: "11:00-12:30", start: "11:00", end: "12:30", label: "11:00 - 12:30" },
  { id: "BREAK",       start: "12:30", end: "14:00", label: "12:30 - 14:00 — استراحة", isBreak: true },
  { id: "14:00-15:30", start: "14:00", end: "15:30", label: "14:00 - 15:30" },
  { id: "15:30-17:00", start: "15:30", end: "17:00", label: "15:30 - 17:00" },
];

export const SESSION_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  lecture: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "bg-blue-500",
    dot: "bg-blue-500",
  },
  td: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "bg-amber-500",
    dot: "bg-amber-500",
  },
  tp: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    badge: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  exam: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
    badge: "bg-purple-500",
    dot: "bg-purple-500",
  },
};

export const SESSION_TYPE_LABELS: Record<string, string> = {
  lecture: "محاضرة",
  td: "أعمال موجهة",
  tp: "أعمال تطبيقية",
  exam: "امتحان",
};

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  group: "عرض المجموعة",
  professor: "عرض الأستاذ",
  room: "عرض القاعة",
  department: "عرض القسم",
};
