import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface SessionCardProps {
  id: string
  title: string
  subtitle: string
  dayOfWeek: number
  startTime: string
  endTime: string
  durationMinutes: number
}

export function SessionCard({ id, title, subtitle, dayOfWeek, startTime, endTime, durationMinutes }: SessionCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      id,
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-blue-50 border border-blue-200 rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="font-semibold text-sm text-blue-900">{title}</div>
      <div className="text-xs text-blue-700">{subtitle}</div>
      <div className="text-xs text-gray-500 mt-1">{startTime} - {endTime}</div>
    </div>
  )
}
