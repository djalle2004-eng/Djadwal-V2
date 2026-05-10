import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface ConflictCheckParams {
  assignmentId?: string
  professorId: string
  groupId?: string | null
  roomId?: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  semester?: string | null
  academicYear?: string | null
}

export interface ConflictResult {
  hasConflict: boolean
  conflicts: string[]
}

export async function checkConflicts(params: ConflictCheckParams): Promise<ConflictResult> {
  const { assignmentId, professorId, groupId, roomId, dayOfWeek, startTime, endTime, semester, academicYear } = params
  
  // Find all assignments on the same day that might overlap
  const query: any = {
    dayOfWeek,
    NOT: assignmentId ? { id: assignmentId } : undefined,
  }

  if (semester) query.semester = semester;
  if (academicYear) query.academicYear = academicYear;

  const potentialConflicts = await prisma.assignment.findMany({
    where: query,
    include: {
      professor: true,
      group: true,
      room: true,
      course: true
    }
  })

  const conflicts: string[] = []

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const startMins = timeToMinutes(startTime)
  const endMins = timeToMinutes(endTime)

  for (const p of potentialConflicts) {
    const pStartMins = timeToMinutes(p.startTime)
    const pEndMins = timeToMinutes(p.endTime)

    // Check time overlap
    const overlaps = startMins < pEndMins && endMins > pStartMins
    if (!overlaps) continue

    if (p.professorId === professorId) {
      conflicts.push(`Professor ${p.professor?.name} is already teaching ${p.course?.name} at this time.`)
    }
    if (groupId && p.groupId === groupId) {
      conflicts.push(`Group ${p.group?.name} already has ${p.course?.name} at this time.`)
    }
    if (roomId && p.roomId === roomId) {
      conflicts.push(`Room ${p.room?.name} is already occupied by ${p.course?.name}.`)
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  }
}
