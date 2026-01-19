import type { calendar_v3 } from "@googleapis/calendar";

import { clerkClient } from "@clerk/nextjs/server"
import { calendar } from "@googleapis/calendar"
import { OAuth2Client } from "google-auth-library"

type GoogleCalendar = calendar_v3.Schema$CalendarListEntry

export async function getCalendars(userId: string) {
  const client = await clerkClient()
  const token = await client.users.getUserOauthAccessToken(userId, "google")
  const accessToken = token.data[0]?.token

  if (!accessToken) {
    throw new Error("Google access token not found")
  }

  const authClient = new OAuth2Client()
  authClient.setCredentials({ access_token: accessToken })
  const calendarClient = calendar({ auth: authClient, version: "v3" })

  const calendars: GoogleCalendar[] = []
  let pageToken: string | undefined

  do {
    const { data } = await calendarClient.calendarList.list({
      maxResults: 250,
      pageToken,
    })

    const items = data.items ?? []
    calendars.push(...items)
    pageToken = data.nextPageToken ?? undefined
  } while (pageToken)

  return calendars
}
