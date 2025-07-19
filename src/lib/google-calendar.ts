import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getGoogleCalendarAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No access token found')
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  auth.setCredentials({
    access_token: session.accessToken as string,
    refresh_token: session.refreshToken as string,
  })

  return auth
}

export async function listGoogleCalendarEvents(timeMin?: Date, timeMax?: Date) {
  try {
    const auth = await getGoogleCalendarAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin?.toISOString() || new Date().toISOString(),
      timeMax: timeMax?.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error)
    throw error
  }
}

export async function createGoogleCalendarEvent(event: {
  summary: string
  description?: string
  start: Date
  end: Date
}) {
  try {
    const auth = await getGoogleCalendarAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'Europe/Paris',
        },
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating Google Calendar event:', error)
    throw error
  }
}

export async function updateGoogleCalendarEvent(
  eventId: string,
  event: {
    summary?: string
    description?: string
    start?: Date
    end?: Date
  }
) {
  try {
    const auth = await getGoogleCalendarAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const updateData: Record<string, unknown> = {}
    
    if (event.summary) updateData.summary = event.summary
    if (event.description) updateData.description = event.description
    if (event.start) {
      updateData.start = {
        dateTime: event.start.toISOString(),
        timeZone: 'Europe/Paris',
      }
    }
    if (event.end) {
      updateData.end = {
        dateTime: event.end.toISOString(),
        timeZone: 'Europe/Paris',
      }
    }

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: updateData,
    })

    return response.data
  } catch (error) {
    console.error('Error updating Google Calendar event:', error)
    throw error
  }
}

export async function deleteGoogleCalendarEvent(eventId: string) {
  try {
    const auth = await getGoogleCalendarAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    })

    return true
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error)
    throw error
  }
}