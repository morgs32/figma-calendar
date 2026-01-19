import { clerkClient } from "@clerk/nextjs/server"
import { endOfMonth, startOfMonth } from "date-fns"
import { eq } from "drizzle-orm"

import { getEventColor } from "@/app/events/eventColors"
import { calendarSelection } from "@/db/schema"
import { pg } from "@/pg"

interface GoogleCalendarEventsResponse {
  items?: Record<string, unknown>[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const isEventsResponse = (value: unknown): value is GoogleCalendarEventsResponse => {
  if (!isRecord(value)) {
    return false
  }

  if (value.items === undefined) {
    return true
  }

  return Array.isArray(value.items) && value.items.every(isRecord)
}

export async function getCalendarEvents(userId: string, year: number, month: number) {
  // Get user's selected calendars
  const selections = await pg
    .select()
    .from(calendarSelection)
    .where(eq(calendarSelection.userId, userId))

  if (selections.length === 0) {
    return []
  }

  const calendarIds = selections.map((selection) => selection.calendarId)

  const client = await clerkClient()
  const token = await client.users.getUserOauthAccessToken(userId, 'google')
  const accessToken = token.data[0].token

  // Calculate start and end of month
  const monthDate = new Date(year, month - 1) // month is 0-based in Date constructor
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)

  // Get events for each calendar
  const events = await Promise.all(
    calendarIds.map(async (calendarId) => {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          calendarId
        )}/events?timeMin=${monthStart.toISOString()}&timeMax=${monthEnd.toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        return []
      }

      const data: unknown = await response.json()
      const items = isEventsResponse(data) ? data.items ?? [] : []
      return items.map((item) => {
        if (!isRecord(item)) return item
        const eventId = typeof item.id === "string" ? item.id : "unknown"
        return {
          ...item,
          eventColor: getEventColor(`${calendarId}:${eventId}`),
        }
      })
    })
  )

  // Flatten all events into a single array
  return events.flat()
}
