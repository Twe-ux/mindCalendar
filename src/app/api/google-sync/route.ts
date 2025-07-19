import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'
import { listGoogleCalendarEvents, createGoogleCalendarEvent } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'import') {
      const googleEvents = await listGoogleCalendarEvents()
      
      await dbConnect()
      
      const importedEvents = []
      
      for (const gEvent of googleEvents) {
        if (!gEvent.id || !gEvent.summary) continue
        
        const existingEvent = await CalendarEvent.findOne({
          googleEventId: gEvent.id,
          userId: session.user.email
        })
        
        if (!existingEvent && gEvent.start?.dateTime && gEvent.end?.dateTime) {
          const newEvent = new CalendarEvent({
            userId: session.user.email,
            title: gEvent.summary,
            description: gEvent.description || '',
            startDate: new Date(gEvent.start.dateTime),
            endDate: new Date(gEvent.end.dateTime),
            googleEventId: gEvent.id,
            isFromMindMap: false
          })
          
          await newEvent.save()
          importedEvents.push(newEvent)
        }
      }
      
      return NextResponse.json({ 
        message: `${importedEvents.length} événements importés`,
        events: importedEvents
      })
    }
    
    return NextResponse.json({ error: 'Action non valide' }, { status: 400 })
  } catch (error) {
    console.error('Error in Google sync:', error)
    return NextResponse.json({ error: 'Erreur de synchronisation' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, startDate, endDate, mindMapNodeId } = body
    
    const googleEvent = await createGoogleCalendarEvent({
      summary: title,
      description,
      start: new Date(startDate),
      end: new Date(endDate)
    })
    
    await dbConnect()
    
    const newEvent = new CalendarEvent({
      userId: session.user.email,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      googleEventId: googleEvent.id,
      mindMapNodeId,
      isFromMindMap: !!mindMapNodeId
    })
    
    await newEvent.save()
    
    return NextResponse.json({
      message: 'Événement créé et synchronisé avec Google Calendar',
      event: newEvent
    })
  } catch (error) {
    console.error('Error creating synced event:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}