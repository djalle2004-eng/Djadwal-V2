/**
 * Conflict Detection Service — lib/services/conflict-detection.ts
 *
 * Handles 4 types of schedule conflicts:
 *  1. PROFESSOR_CONFLICT   — same professor, overlapping time
 *  2. ROOM_CONFLICT        — same room, overlapping time
 *  3. GROUP_CONFLICT       — same group, overlapping time
 *  4. SPECIALIZATION_CONFLICT — lecture blocks TD/TP for the same specialization
 *
 * Special rules:
 *  - A "lecture" blocks all groups of that specialization simultaneously
 *  - TD/TP cannot run in parallel with a lecture of the same specialization
 *  - Exam sessions have the highest priority and can force through non-critical conflicts
 */

import db from "@/lib/db";

// ─────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────

export type ConflictType =
  | "PROFESSOR_CONFLICT"
  | "ROOM_CONFLICT"
  | "GROUP_CONFLICT"
  | "SPECIALIZATION_CONFLICT";

export type SessionType = "lecture" | "td" | "tp" | "exam";

/** Lightweight representation of a conflicting session returned to the caller */
export interface SessionInfo {
  id: string;
  courseName: string;
  courseCode: string;
  professorName: string;
  groupName: string | null;
  roomName: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  sessionType: string;
}

export interface ConflictDetail {
  type: ConflictType;
  message: string;
  conflictingSession: SessionInfo;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictDetail[];
  /** true when every detected conflict CAN be bypassed (e.g., exam override) */
  canForce: boolean;
}

/** Input payload describing the session being checked / created */
export interface SessionInput {
  /** If provided, the session being edited will be excluded from checks */
  excludeId?: string;

  courseId: string;
  professorId: string;
  groupId?: string | null;
  roomId?: string | null;
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  sessionType: SessionType;
  semester?: string | null;
  academicYear?: string | null;
  /** Specialization ID / name — required for SPECIALIZATION_CONFLICT detection */
  specialization?: string | null;
}

export interface CheckOptions {
  /** When true, the function still runs all checks but marks canForce=true appropriately */
  ignoreConflicts?: boolean;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Convert "HH:mm" to total minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Returns true when [aStart, aEnd) and [bStart, bEnd) overlap */
export function timesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = timeToMinutes(aStart);
  const aE = timeToMinutes(aEnd);
  const bS = timeToMinutes(bStart);
  const bE = timeToMinutes(bEnd);
  return aS < bE && aE > bS;
}

/** Whether a conflict type can be overridden by an exam session */
function isForceableByExam(type: ConflictType): boolean {
  // Exams can override room and group conflicts only
  // (professor still cannot be in two places, and specialization conflicts persist)
  return type === "ROOM_CONFLICT" || type === "GROUP_CONFLICT";
}

/** Map a raw Prisma assignment row to a SessionInfo */
function toSessionInfo(row: {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  sessionType: string | null;
  course: { name: string; code: string };
  professor: { name: string };
  group: { name: string } | null;
  room: { name: string } | null;
}): SessionInfo {
  return {
    id: row.id,
    courseName: row.course.name,
    courseCode: row.course.code,
    professorName: row.professor.name,
    groupName: row.group?.name ?? null,
    roomName: row.room?.name ?? null,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    sessionType: row.sessionType ?? "lecture",
  };
}

// ─────────────────────────────────────────────
// Shared query fragment (included relations)
// ─────────────────────────────────────────────

const INCLUDE = {
  course: { select: { name: true, code: true } },
  professor: { select: { name: true } },
  group: { select: { name: true } },
  room: { select: { name: true } },
} as const;

// ─────────────────────────────────────────────
// Per-conflict check functions
// ─────────────────────────────────────────────

async function checkProfessorConflict(
  input: SessionInput
): Promise<ConflictDetail[]> {
  const rows = await db.assignment.findMany({
    where: {
      professorId: input.professorId,
      dayOfWeek: input.dayOfWeek,
      ...(input.semester ? { semester: input.semester } : {}),
      ...(input.academicYear ? { academicYear: input.academicYear } : {}),
      ...(input.excludeId ? { NOT: { id: input.excludeId } } : {}),
    },
    include: INCLUDE,
  });

  return rows
    .filter((r) => timesOverlap(input.startTime, input.endTime, r.startTime, r.endTime))
    .map((r) => ({
      type: "PROFESSOR_CONFLICT" as ConflictType,
      message: `الأستاذ "${r.professor.name}" لديه حصة "${r.course.name}" في نفس التوقيت (${r.startTime}–${r.endTime}).`,
      conflictingSession: toSessionInfo(r),
    }));
}

async function checkRoomConflict(
  input: SessionInput
): Promise<ConflictDetail[]> {
  if (!input.roomId) return [];

  const rows = await db.assignment.findMany({
    where: {
      roomId: input.roomId,
      dayOfWeek: input.dayOfWeek,
      ...(input.semester ? { semester: input.semester } : {}),
      ...(input.academicYear ? { academicYear: input.academicYear } : {}),
      ...(input.excludeId ? { NOT: { id: input.excludeId } } : {}),
    },
    include: INCLUDE,
  });

  return rows
    .filter((r) => timesOverlap(input.startTime, input.endTime, r.startTime, r.endTime))
    .map((r) => ({
      type: "ROOM_CONFLICT" as ConflictType,
      message: `القاعة "${r.room?.name}" محجوزة لحصة "${r.course.name}" في نفس التوقيت (${r.startTime}–${r.endTime}).`,
      conflictingSession: toSessionInfo(r),
    }));
}

async function checkGroupConflict(
  input: SessionInput
): Promise<ConflictDetail[]> {
  if (!input.groupId) return [];

  const rows = await db.assignment.findMany({
    where: {
      groupId: input.groupId,
      dayOfWeek: input.dayOfWeek,
      ...(input.semester ? { semester: input.semester } : {}),
      ...(input.academicYear ? { academicYear: input.academicYear } : {}),
      ...(input.excludeId ? { NOT: { id: input.excludeId } } : {}),
    },
    include: INCLUDE,
  });

  return rows
    .filter((r) => timesOverlap(input.startTime, input.endTime, r.startTime, r.endTime))
    .map((r) => ({
      type: "GROUP_CONFLICT" as ConflictType,
      message: `المجموعة "${r.group?.name}" لديها حصة "${r.course.name}" في نفس التوقيت (${r.startTime}–${r.endTime}).`,
      conflictingSession: toSessionInfo(r),
    }));
}

/**
 * SPECIALIZATION_CONFLICT rules:
 *
 * Case A — New session is a LECTURE:
 *   Fetch all TD/TP for ANY group in the same specialization that overlap in time.
 *
 * Case B — New session is TD/TP:
 *   Fetch any LECTURE for the same specialization that overlaps in time.
 *
 * EXAM sessions skip this check entirely (exams override spec constraints).
 */
async function checkSpecializationConflict(
  input: SessionInput
): Promise<ConflictDetail[]> {
  if (!input.specialization) return [];
  if (input.sessionType === "exam") return [];

  const isNewLecture = input.sessionType === "lecture";

  /**
   * The Assignment model stores specialization as a plain string field.
   * We query assignments of the same specialization directly, excluding the
   * current group (if any) so we only catch cross-group/cross-TD conflicts.
   */
  const rows = await db.assignment.findMany({
    where: {
      dayOfWeek: input.dayOfWeek,
      specialization: input.specialization,
      sessionType: isNewLecture
        ? { in: ["td", "tp"] }   // Lecture vs existing TD/TP
        : "lecture",             // TD/TP vs existing Lecture
      ...(input.semester ? { semester: input.semester } : {}),
      ...(input.academicYear ? { academicYear: input.academicYear } : {}),
      ...(input.excludeId ? { NOT: { id: input.excludeId } } : {}),
    },
    include: INCLUDE,
  });

  return rows
    .filter((r) => timesOverlap(input.startTime, input.endTime, r.startTime, r.endTime))
    .map((r) => {
      const typeLabel = isNewLecture ? (r.sessionType ?? "td/tp") : "محاضرة";
      return {
        type: "SPECIALIZATION_CONFLICT" as ConflictType,
        message: isNewLecture
          ? `المحاضرة الجديدة تتعارض مع حصة ${typeLabel} للمجموعة "${r.group?.name}" في نفس التخصص (${r.startTime}–${r.endTime}).`
          : `لا يمكن وضع هذه الحصة بالتوازي مع محاضرة "${r.course.name}" لنفس التخصص (${r.startTime}–${r.endTime}).`,
        conflictingSession: toSessionInfo(r),
      };
    });
}

// ─────────────────────────────────────────────
// Main exported function
// ─────────────────────────────────────────────

export async function checkConflicts(
  newSession: SessionInput,
  options: CheckOptions = {}
): Promise<ConflictResult> {
  const isExam = newSession.sessionType === "exam";

  // Run all checks in parallel for performance
  const [professorConflicts, roomConflicts, groupConflicts, specConflicts] =
    await Promise.all([
      checkProfessorConflict(newSession),
      checkRoomConflict(newSession),
      checkGroupConflict(newSession),
      checkSpecializationConflict(newSession),
    ]);

  const allConflicts: ConflictDetail[] = [
    ...professorConflicts,
    ...roomConflicts,
    ...groupConflicts,
    ...specConflicts,
  ];

  // Deduplicate by conflicting session id + type (edge-case: multiple groups share room)
  const seen = new Set<string>();
  const uniqueConflicts = allConflicts.filter((c) => {
    const key = `${c.type}:${c.conflictingSession.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // canForce is true when:
  //  - the session being added is an exam AND every remaining conflict is forceable
  //  - OR the caller explicitly passes ignoreConflicts=true
  const canForce =
    options.ignoreConflicts === true ||
    (isExam && uniqueConflicts.every((c) => isForceableByExam(c.type)));

  return {
    hasConflict: uniqueConflicts.length > 0,
    conflicts: uniqueConflicts,
    canForce,
  };
}
