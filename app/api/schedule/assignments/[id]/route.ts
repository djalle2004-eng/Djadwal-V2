import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { checkConflicts } from '@/lib/conflict-detection'

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { dayOfWeek, startTime, endTime, roomId } = body

    const assignment = await prisma.assignment.findUnique({
      where: { id }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const conflictCheck = await checkConflicts({
      assignmentId: id,
      professorId: assignment.professorId,
      groupId: assignment.groupId,
      roomId: roomId || assignment.roomId,
      dayOfWeek,
      startTime,
      endTime,
      semester: assignment.semester,
      academicYear: assignment.academicYear
    })

    if (conflictCheck.hasConflict) {
      return NextResponse.json({ error: 'Conflict detected', conflicts: conflictCheck.conflicts }, { status: 409 })
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        ...(roomId ? { roomId } : {})
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
