'use client'

import React, { useState } from 'react'
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core'
import { useScheduleDnd } from '@/hooks/useScheduleDnd'
import { TimeSlot } from './TimeSlot'
import { SessionCard } from './SessionCard'

const toast = {
  success: (msg: string) => alert(`نجاح: ${msg}`),
  error: (msg: string) => alert(`خطأ: ${msg}`)
}

interface AssignmentData {
  id: string
  course: { name: string }
  professor: { name: string }
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface ScheduleGridProps {
  initialAssignments: AssignmentData[]
}

const DAYS = [0, 1, 2, 3, 4, 5] 
const TIMES = ['08:00', '09:30', '11:00', '13:00', '14:30', '16:00']

export function ScheduleGrid({ initialAssignments }: ScheduleGridProps) {
  const [assignments, setAssignments] = useState<AssignmentData[]>(initialAssignments)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const moveAssignment = async (id: string, newDay: number, newStart: string, newEnd: string) => {
    try {
      const oldAssignments = [...assignments]
      setAssignments(prev => prev.map(a => 
        a.id === id ? { ...a, dayOfWeek: newDay, startTime: newStart, endTime: newEnd } : a
      ))

      const res = await fetch(`/api/schedule/assignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: newDay, startTime: newStart, endTime: newEnd })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setAssignments(oldAssignments)
        toast.error(errorData.error || 'فشل في تحديث موعد الحصة')
        if (errorData.conflicts) {
          toast.error(errorData.conflicts.join('\n'))
        }
        return false
      }

      toast.success('تم تحديث موعد الحصة بنجاح')
      return true
    } catch (err: any) {
      toast.error('خطأ في الاتصال')
      return false
    }
  }

  const {
    activeId,
    activeData,
    dropConflict,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  } = useScheduleDnd(moveAssignment)

  const getDurationMins = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    return (eh * 60 + em) - (sh * 60 + sm)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="overflow-x-auto" dir="rtl">
        <div className="min-w-[800px] grid grid-cols-7 gap-px bg-gray-200 border border-gray-300">
          <div className="bg-gray-50 p-2 font-bold text-center">الوقت \ اليوم</div>
          {DAYS.map(day => (
            <div key={day} className="bg-gray-50 p-2 font-bold text-center">
              يوم {day}
            </div>
          ))}

          {TIMES.map(time => (
            <React.Fragment key={time}>
              <div className="bg-gray-50 p-2 text-center text-sm font-medium border-t border-gray-200 flex items-center justify-center">
                {time}
              </div>
              {DAYS.map(day => {
                const slotAssignments = assignments.filter(a => a.dayOfWeek === day && a.startTime === time)
                return (
                  <TimeSlot
                    key={`${day}-${time}`}
                    dayOfWeek={day}
                    time={time}
                    isOverInvalid={dropConflict}
                    isOverValid={!dropConflict}
                  >
                    {slotAssignments.map(a => (
                      <SessionCard
                        key={a.id}
                        id={a.id}
                        title={a.course.name}
                        subtitle={a.professor.name}
                        dayOfWeek={a.dayOfWeek}
                        startTime={a.startTime}
                        endTime={a.endTime}
                        durationMinutes={getDurationMins(a.startTime, a.endTime)}
                      />
                    ))}
                  </TimeSlot>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeId && activeData ? (
          <div className="opacity-80 scale-105" dir="rtl">
            <SessionCard
              id={activeData.id}
              title="جاري النقل..."
              subtitle=""
              dayOfWeek={activeData.dayOfWeek}
              startTime={activeData.startTime}
              endTime={activeData.endTime}
              durationMinutes={activeData.durationMinutes}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
