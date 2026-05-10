import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface TimeSlotProps {
  dayOfWeek: number
  time: string
  children?: React.ReactNode
  isOverValid?: boolean
  isOverInvalid?: boolean
}

export function TimeSlot({ dayOfWeek, time, children, isOverValid, isOverInvalid }: TimeSlotProps) {
  const id = `slot-${dayOfWeek}-${time}`
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      dayOfWeek,
      time
    }
  })

  let bgClass = 'bg-white'
  if (isOver) {
    bgClass = isOverInvalid ? 'bg-red-100 border-2 border-red-500' : 'bg-green-100 border-2 border-green-500'
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] p-2 border border-gray-200 transition-colors ${bgClass}`}
    >
      {children}
    </div>
  )
}
