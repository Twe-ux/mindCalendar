import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    await dbConnect()
    
    const query: Record<string, unknown> = { userId: session.user.email }
    
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
    
    const events = await CalendarEvent.find(query).sort({ startDate: 1 })
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    
    await dbConnect()
    
    const newEvent = new CalendarEvent({
      ...body,
      userId: session.user.email
    })
    
    await newEvent.save()
    
    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    await dbConnect()
    
    const updatedEvent = await CalendarEvent.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      updateData,
      { new: true }
    )
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }
    
    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    await dbConnect()
    
    const deletedEvent = await CalendarEvent.findOneAndDelete({
      _id: id,
      userId: session.user.email
    })
    
    if (!deletedEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Événement supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}