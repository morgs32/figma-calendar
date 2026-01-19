"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import invariant from "tiny-invariant"

import { getEventColor } from "@/app/events/eventColors"
import { allDayEvent, calendar, calendarSelection } from "@/db/schema"
import { getCalendars } from "@/google/getCalendars"
import { pg } from "@/pg"

export async function syncCalendars() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const calendars = await getCalendars(userId)

  const calendarsToUpsert = calendars
    .filter((calendar) => calendar.id)
    .map((calendar) => {
      invariant(calendar.id)
      return {
        calendarColor: calendar.backgroundColor ?? null,
        calendarColorId: calendar.colorId ?? null,
        calendarForegroundColor: calendar.foregroundColor ?? null,
        calendarId: calendar.id,
        calendarSummary: calendar.summary ?? "Untitled calendar",
        calendarSummaryOverride: calendar.summaryOverride ?? null,
        userId,
      }
    })

  if (calendarsToUpsert.length > 0) {
    await pg
      .insert(calendar)
      .values(calendarsToUpsert)
      .onConflictDoUpdate({
        set: {
          calendarColor: sql`excluded.${sql.identifier("calendarColor")}`,
          calendarColorId: sql`excluded.${sql.identifier("calendarColorId")}`,
          calendarForegroundColor: sql`excluded.${sql.identifier("calendarForegroundColor")}`,
          calendarSummary: sql`excluded.${sql.identifier("calendarSummary")}`,
          calendarSummaryOverride: sql`excluded.${sql.identifier("calendarSummaryOverride")}`,
          updatedAt: sql`now()`,
        },
        target: [calendar.userId, calendar.calendarId],
      })
  }

  revalidatePath("/calendars")
}

export async function setCalendarSelection(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const calendarId = formData.get("calendarId")
  if (typeof calendarId !== "string" || !calendarId) {
    throw new Error("Missing calendarId")
  }

  const selected = formData.get("selected") === "on"

  await (selected ? pg
      .insert(calendarSelection)
      .values({ calendarId, userId })
      .onConflictDoNothing() : pg
      .delete(calendarSelection)
      .where(
        and(
          eq(calendarSelection.userId, userId),
          eq(calendarSelection.calendarId, calendarId)
        )
      ));

  revalidatePath("/calendars")
}

interface GoogleEvent {
  end?: { date?: string }
  id?: string
  start?: { date?: string }
  summary?: string
}

export async function syncCalendarEvents(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const calendarId = formData.get("calendarId")
  if (typeof calendarId !== "string" || !calendarId) {
    throw new Error("Missing calendarId")
  }

  const client = await clerkClient()
  const token = await client.users.getUserOauthAccessToken(userId, "google")
  const accessToken = token.data[0]?.token

  if (!accessToken) {
    throw new Error("Google access token not found")
  }

  const events: GoogleEvent[] = []
  let pageToken: string | undefined

  do {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events?singleEvents=true&orderBy=startTime&maxResults=2500${
        pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch events")
    }

    const data = (await response.json()) as {
      items?: GoogleEvent[]
      nextPageToken?: string
    }

    events.push(...(data.items ?? []))
    pageToken = data.nextPageToken ?? undefined
  } while (pageToken)

  const allDayEvents = events
    .filter((event) => event.id && event.start?.date && event.end?.date)
    .map((event) => {
      const eventId = event.id

      invariant(eventId)
      invariant(event.end?.date)
      invariant(event.start?.date)
      return {
        calendarId,
        endDate: new Date(event.end.date),
        eventColor: getEventColor(`${calendarId}:${eventId}`),
        eventId,
        eventName: event.summary ?? "Untitled event",
        startDate: new Date(event.start.date),
        userId,
      }
    })

  await pg
    .delete(allDayEvent)
    .where(
      and(eq(allDayEvent.userId, userId), eq(allDayEvent.calendarId, calendarId))
    )

  if (allDayEvents.length > 0) {
    await pg.insert(allDayEvent).values(allDayEvents)
  }

  revalidatePath("/calendars")
}
