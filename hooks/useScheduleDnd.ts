import { useState, useCallback } from 'react'
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'

export interface DragItemData {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomId?: string
  durationMinutes: number
}

export function useScheduleDnd(
  onMoveAssignment: (id: string, newDay: number, newStartTime: string, newEndTime: string) => Promise<boolean>
) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeData, setActiveData] = useState<DragItemData | null>(null)
  const [dropConflict, setDropConflict] = useState<boolean>(false)
  const [overId, setOverId] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveData(event.active.data.current as DragItemData)
  }

  const handleDragOver = async (event: DragOverEvent) => {
    const { over, active } = event
    setOverId(over?.id as string || null)
    
    // In a full implementation, you could debounce a call to /api/schedule/validate here
    // For now, we assume valid until dropped to prevent excessive API calls during drag
    setDropConflict(false)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    setActiveData(null)
    setOverId(null)
    setDropConflict(false)

    const { active, over } = event
    if (!over) return

    // over.id is typically formatted like "slot-0-08:00"
    const overIdStr = String(over.id)
    if (!overIdStr.startsWith('slot-')) return

    const [, dayStr, timeStr] = overIdStr.split('-')
    const dayOfWeek = parseInt(dayStr, 10)
    const startTime = timeStr

    // Calculate new endTime based on original duration
    const activeItem = active.data.current as DragItemData
    if (!activeItem) return
    
    const [h, m] = startTime.split(':').map(Number)
    const endTotalMins = h * 60 + m + activeItem.durationMinutes
    const endH = Math.floor(endTotalMins / 60)
    const endM = endTotalMins % 60
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

    // If no change, return
    if (activeItem.dayOfWeek === dayOfWeek && activeItem.startTime === startTime) return

    const confirmed = window.confirm(`Move session to Day ${dayOfWeek} at ${startTime}?`)
    if (confirmed) {
      await onMoveAssignment(active.id as string, dayOfWeek, startTime, endTime)
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveData(null)
    setOverId(null)
    setDropConflict(false)
  }

  return {
    activeId,
    activeData,
    overId,
    dropConflict,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  }
}
