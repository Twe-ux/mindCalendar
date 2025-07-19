'use client'

import React, { useState, useCallback } from 'react'
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CalendarEvent } from '@/lib/types'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid } from 'lucide-react'

const localizer = momentLocalizer(moment)

interface CalendarComponentProps {
  events: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
}

const CustomEvent = ({ event }: { event: Event }) => {
  const calendarEvent = event as CalendarEvent
  return (
    <div className="h-full p-1">
      <div className={`text-xs font-medium truncate ${
        calendarEvent.isFromMindMap ? 'text-blue-800' : 'text-gray-800'
      }`}>
        {event.title}
      </div>
      {calendarEvent.isFromMindMap && (
        <div className="text-xs text-blue-600">📋 Mind Map</div>
      )}
    </div>
  )
}

export default function CalendarComponent({ 
  events, 
  onSelectEvent, 
  onSelectSlot 
}: CalendarComponentProps) {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  const handleSelectEvent = useCallback((event: Event) => {
    if (onSelectEvent) {
      onSelectEvent(event as CalendarEvent)
    }
  }, [onSelectEvent])

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo)
    }
  }, [onSelectSlot])

  const navigateDate = (action: 'prev' | 'next' | 'today') => {
    let newDate = new Date(date)
    
    switch (action) {
      case 'prev':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() - 7)
        } else {
          newDate.setDate(newDate.getDate() - 1)
        }
        break
      case 'next':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() + 1)
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() + 7)
        } else {
          newDate.setDate(newDate.getDate() + 1)
        }
        break
      case 'today':
        newDate = new Date()
        break
    }
    
    setDate(newDate)
  }

  const formatDateTitle = () => {
    if (view === 'month') {
      return moment(date).format('MMMM YYYY')
    } else if (view === 'week') {
      const start = moment(date).startOf('week')
      const end = moment(date).endOf('week')
      return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`
    } else {
      return moment(date).format('dddd, D MMMM YYYY')
    }
  }

  const eventStyleGetter = (event: Event) => {
    const calendarEvent = event as CalendarEvent
    let backgroundColor = '#3b82f6'
    
    if (calendarEvent.isFromMindMap) {
      backgroundColor = '#10b981'
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {formatDateTitle()}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateDate('today')}
              className="px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Grid size={16} className="inline mr-1" />
              Mois
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List size={16} className="inline mr-1" />
              Semaine
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === 'day' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon size={16} className="inline mr-1" />
              Jour
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Calendar
          localizer={localizer}
          events={events.map(event => ({
            ...event,
            start: new Date(event.startDate),
            end: new Date(event.endDate),
          }))}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent,
          }}
          style={{ height: '100%' }}
          messages={{
            next: 'Suivant',
            previous: 'Précédent',
            today: "Aujourd&apos;hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Aucun événement dans cette période',
            showMore: (total) => `+ ${total} de plus`,
          }}
        />
      </div>
    </div>
  )
}