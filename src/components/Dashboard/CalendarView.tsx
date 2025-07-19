'use client'

import React from 'react'
import CalendarComponent from '@/components/Calendar/CalendarComponent'
import { CalendarEvent } from '@/lib/types'

interface CalendarViewProps {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onSelectSlot: (slot: any) => void
}

export default function CalendarView({ events, onSelectEvent, onSelectSlot }: CalendarViewProps) {
  return (
    <div id="calendar-drop-zone" className="h-full">
      <CalendarComponent
        events={events}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
      />
    </div>
  )
}