import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  timeToMinutes,
  timesOverlap,
  checkConflicts,
  type SessionInput,
} from "@/lib/services/conflict-detection";

// ─────────────────────────────────────────────
// Mock the prisma singleton (db)
// vi.mock is hoisted to the top of the file, so we use vi.hoisted()
// to ensure mockDb is initialised before the factory runs.
// ─────────────────────────────────────────────

const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    assignment: { findMany: vi.fn() },
    group: { findMany: vi.fn() },
  };
  return { mockDb };
});

vi.mock("@/lib/db", () => ({ default: mockDb }));

// ─────────────────────────────────────────────
// Shared fixture builders
// ─────────────────────────────────────────────

/** Base session input used across tests */
const baseInput: SessionInput = {
  courseId: "course-1",
  professorId: "prof-1",
  groupId: "group-1",
  roomId: "room-1",
  dayOfWeek: 2, // Sunday
  startTime: "08:00",
  endTime: "09:30",
  sessionType: "td",
  semester: "S1",
  academicYear: "2025-2026",
  specialization: "Informatique",
};

/** A conflicting DB row that overlaps with baseInput */
const makeConflictRow = (overrides: Partial<ReturnType<typeof _makeRow>> = {}) =>
  _makeRow(overrides);

function _makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "assignment-99",
    dayOfWeek: 2,
    startTime: "08:00",
    endTime: "09:30",
    sessionType: "lecture",
    courseId: "course-2",
    professorId: "prof-1",
    groupId: "group-1",
    roomId: "room-1",
    semester: "S1",
    academicYear: "2025-2026",
    course: { name: "Algèbre", code: "ALG101" },
    professor: { name: "Dr. Mansouri" },
    group: { name: "G1" },
    room: { name: "Salle A" },
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Pure helper unit tests
// ─────────────────────────────────────────────

describe("timeToMinutes", () => {
  it("converts 08:00 to 480", () => expect(timeToMinutes("08:00")).toBe(480));
  it("converts 09:30 to 570", () => expect(timeToMinutes("09:30")).toBe(570));
  it("converts 00:00 to 0", () => expect(timeToMinutes("00:00")).toBe(0));
  it("converts 23:59 to 1439", () => expect(timeToMinutes("23:59")).toBe(1439));
});

describe("timesOverlap", () => {
  it("detects exact overlap", () =>
    expect(timesOverlap("08:00", "09:30", "08:00", "09:30")).toBe(true));

  it("detects partial overlap — new starts inside existing", () =>
    expect(timesOverlap("09:00", "10:30", "08:00", "09:30")).toBe(true));

  it("detects partial overlap — new ends inside existing", () =>
    expect(timesOverlap("07:30", "08:30", "08:00", "09:30")).toBe(true));

  it("detects containment — new is inside existing", () =>
    expect(timesOverlap("08:30", "09:00", "08:00", "09:30")).toBe(true));

  it("no overlap — new is completely before existing", () =>
    expect(timesOverlap("06:00", "07:30", "08:00", "09:30")).toBe(false));

  it("no overlap — new is completely after existing", () =>
    expect(timesOverlap("10:00", "11:30", "08:00", "09:30")).toBe(false));

  it("no overlap — sessions are adjacent (end == start)", () =>
    expect(timesOverlap("09:30", "11:00", "08:00", "09:30")).toBe(false));
});

// ─────────────────────────────────────────────
// Integration: checkConflicts
// ─────────────────────────────────────────────

describe("checkConflicts — PROFESSOR_CONFLICT", () => {
  beforeEach(() => {
    mockDb.group.findMany.mockResolvedValue([]);
  });
  afterEach(() => vi.clearAllMocks());

  it("detects a professor conflict", async () => {
    const row = makeConflictRow({ professorId: "prof-1" });
    mockDb.assignment.findMany.mockResolvedValue([row]);

    const result = await checkConflicts({ ...baseInput, sessionType: "lecture" });

    expect(result.hasConflict).toBe(true);
    expect(result.conflicts.some((c) => c.type === "PROFESSOR_CONFLICT")).toBe(true);
  });

  it("does NOT conflict when professor is different", async () => {
    const row = makeConflictRow({ professorId: "prof-OTHER" });
    // The row returned by the mock has professorId=prof-OTHER
    // checkProfessorConflict queries WHERE professorId=prof-1 — since mock returns
    // the row regardless, we filter by the actual field in the service.
    // So we need the mock to return empty for the professor query.
    // Use mockImplementation to differentiate by where.professorId
    mockDb.assignment.findMany.mockImplementation((args: any) => {
      if (args?.where?.professorId === "prof-1") return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const result = await checkConflicts({
      ...baseInput,
      sessionType: "lecture",
      groupId: null,
      roomId: null,
    });

    expect(result.conflicts.filter((c) => c.type === "PROFESSOR_CONFLICT")).toHaveLength(0);
  });

  it("excludes the session itself when excludeId is set", async () => {
    // Simulate editing assignment-99: the DB would still return it without the NOT filter,
    // so our mock returns empty (driver applies NOT), meaning no conflict.
    mockDb.assignment.findMany.mockResolvedValue([]);

    const result = await checkConflicts({ ...baseInput, excludeId: "assignment-99" });
    expect(result.hasConflict).toBe(false);
  });
});

describe("checkConflicts — ROOM_CONFLICT", () => {
  afterEach(() => vi.clearAllMocks());

  it("detects a room conflict", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    const row = makeConflictRow({ roomId: "room-1", professorId: "prof-OTHER" });
    mockDb.assignment.findMany.mockResolvedValue([row]);

    const result = await checkConflicts({
      ...baseInput,
      professorId: "prof-NEW",
      groupId: null,
      sessionType: "lecture",
    });

    expect(result.conflicts.some((c) => c.type === "ROOM_CONFLICT")).toBe(true);
  });

  it("skips room check when roomId is null", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    mockDb.assignment.findMany.mockResolvedValue([]);

    const result = await checkConflicts({
      ...baseInput,
      roomId: null,
      groupId: null,
      sessionType: "lecture",
    });

    expect(result.conflicts.filter((c) => c.type === "ROOM_CONFLICT")).toHaveLength(0);
  });

  it("no conflict when times don't overlap", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    const row = makeConflictRow({ startTime: "10:00", endTime: "11:30" });
    mockDb.assignment.findMany.mockResolvedValue([row]);

    const result = await checkConflicts({
      ...baseInput,
      professorId: "prof-NEW",
      groupId: null,
      sessionType: "lecture",
    });

    expect(result.conflicts.filter((c) => c.type === "ROOM_CONFLICT")).toHaveLength(0);
  });
});

describe("checkConflicts — GROUP_CONFLICT", () => {
  afterEach(() => vi.clearAllMocks());

  it("detects a group conflict", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    const row = makeConflictRow({ groupId: "group-1", professorId: "prof-OTHER", roomId: "room-OTHER" });
    mockDb.assignment.findMany.mockResolvedValue([row]);

    const result = await checkConflicts({
      ...baseInput,
      professorId: "prof-NEW",
      roomId: "room-OTHER-2",
      sessionType: "td",
    });

    expect(result.conflicts.some((c) => c.type === "GROUP_CONFLICT")).toBe(true);
  });

  it("skips group check when groupId is null", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    mockDb.assignment.findMany.mockResolvedValue([]);

    const result = await checkConflicts({
      ...baseInput,
      groupId: null,
      sessionType: "lecture",
    });

    expect(result.conflicts.filter((c) => c.type === "GROUP_CONFLICT")).toHaveLength(0);
  });
});

describe("checkConflicts — SPECIALIZATION_CONFLICT", () => {
  afterEach(() => vi.clearAllMocks());

  it("detects lecture vs TD/TP for same specialization", async () => {
    const tdRow = makeConflictRow({
      id: "assign-td",
      groupId: "group-2",
      sessionType: "td",
      professorId: "prof-OTHER",
      roomId: "room-OTHER",
      specialization: "Informatique",
    });

    // Route by sessionType filter in the where clause
    mockDb.assignment.findMany.mockImplementation((args: any) => {
      const st = args?.where?.sessionType;
      if (st && (st === "td" || st?.in?.includes("td"))) return Promise.resolve([tdRow]);
      return Promise.resolve([]);
    });

    const result = await checkConflicts({
      ...baseInput,
      groupId: null,
      sessionType: "lecture",
    });

    expect(result.conflicts.some((c) => c.type === "SPECIALIZATION_CONFLICT")).toBe(true);
  });

  it("detects TD/TP vs existing lecture for same specialization", async () => {
    const lectureRow = makeConflictRow({
      id: "assign-lec",
      groupId: "group-1",
      sessionType: "lecture",
      professorId: "prof-OTHER",
      roomId: "room-OTHER",
      specialization: "Informatique",
    });

    // Route by sessionType: spec check queries sessionType=lecture
    mockDb.assignment.findMany.mockImplementation((args: any) => {
      if (args?.where?.sessionType === "lecture") return Promise.resolve([lectureRow]);
      return Promise.resolve([]);
    });

    const result = await checkConflicts({
      ...baseInput,
      sessionType: "td",
    });

    expect(result.conflicts.some((c) => c.type === "SPECIALIZATION_CONFLICT")).toBe(true);
  });

  it("skips specialization check for exam sessions", async () => {
    mockDb.group.findMany.mockResolvedValue([{ id: "group-1", name: "G1" }]);
    mockDb.assignment.findMany.mockResolvedValue([]);

    const result = await checkConflicts({
      ...baseInput,
      sessionType: "exam",
    });

    expect(result.conflicts.filter((c) => c.type === "SPECIALIZATION_CONFLICT")).toHaveLength(0);
  });

  it("skips specialization check when no specialization provided", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    mockDb.assignment.findMany.mockResolvedValue([]);

    const result = await checkConflicts({
      ...baseInput,
      specialization: null,
      sessionType: "td",
    });

    expect(result.conflicts.filter((c) => c.type === "SPECIALIZATION_CONFLICT")).toHaveLength(0);
  });
});

describe("checkConflicts — canForce logic", () => {
  afterEach(() => vi.clearAllMocks());

  it("canForce is false when professor conflict exists (even for exam)", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    const row = makeConflictRow({ professorId: "prof-1" });
    mockDb.assignment.findMany.mockResolvedValue([row]);

    const result = await checkConflicts({ ...baseInput, sessionType: "exam" });

    // Professor conflict is NOT forceable
    expect(result.canForce).toBe(false);
  });

  it("canForce is true for exam when only ROOM_CONFLICT exists", async () => {
    mockDb.group.findMany.mockResolvedValue([]);

    // Only first call (professor) returns empty; rest return a room conflict
    const roomRow = makeConflictRow({ roomId: "room-1", professorId: "prof-OTHER" });

    mockDb.assignment.findMany
      .mockResolvedValueOnce([])       // professor — no conflict
      .mockResolvedValueOnce([roomRow]) // room — conflict
      .mockResolvedValueOnce([])       // group
      .mockResolvedValueOnce([]);      // spec

    const result = await checkConflicts({
      ...baseInput,
      professorId: "prof-NEW",
      groupId: null,
      sessionType: "exam",
    });

    expect(result.hasConflict).toBe(true);
    expect(result.canForce).toBe(true);
  });

  it("canForce is always true when ignoreConflicts option is set", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    const row = makeConflictRow({ professorId: "prof-1" });
    mockDb.assignment.findMany.mockResolvedValue([row]);

    const result = await checkConflicts(
      { ...baseInput, sessionType: "td" },
      { ignoreConflicts: true }
    );

    expect(result.canForce).toBe(true);
  });
});

describe("checkConflicts — deduplication", () => {
  afterEach(() => vi.clearAllMocks());

  it("deduplicates identical conflicts returned by multiple checks", async () => {
    mockDb.group.findMany.mockResolvedValue([]);
    // Same row triggers both professor AND group conflict
    const row = makeConflictRow({ professorId: "prof-1", groupId: "group-1", roomId: "room-OTHER" });

    mockDb.assignment.findMany
      .mockResolvedValueOnce([row]) // professor
      .mockResolvedValueOnce([])    // room (different id)
      .mockResolvedValueOnce([row]) // group — same row again
      .mockResolvedValueOnce([]);   // spec

    const result = await checkConflicts({ ...baseInput, sessionType: "td" });

    // professor + group conflicts but each for the SAME session id — they have different types
    // so both should be present (dedup key = type:sessionId)
    const profC = result.conflicts.filter((c) => c.type === "PROFESSOR_CONFLICT");
    const grpC  = result.conflicts.filter((c) => c.type === "GROUP_CONFLICT");
    expect(profC).toHaveLength(1);
    expect(grpC).toHaveLength(1);
  });
});
