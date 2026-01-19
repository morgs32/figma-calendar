import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { allDayEvent, calendar, calendarSelection } from "@/db/schema"
import { pg } from "@/pg"

import { setCalendarSelection, syncCalendarEvents, syncCalendars } from "./actions"
import { CalendarSelectionCheckbox } from "./CalendarSelectionCheckbox"

export default async function CalendarPage() {
  const { userId } = await auth()
  if (!userId) {
    return (
      <main className="min-h-screen bg-background py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Calendars
          </h1>
          <p className="text-muted-foreground">
            Sign in to view and sync your calendars.
          </p>
        </div>
      </main>
    )
  }

  const calendars = await pg
    .select()
    .from(calendar)
    .where(eq(calendar.userId, userId))
    .orderBy(calendar.createdAt)

  const selections = await pg
    .select()
    .from(calendarSelection)
    .where(eq(calendarSelection.userId, userId))

  const selectedIds = new Set(selections.map((selection) => selection.calendarId))
  const eventRows = await pg
    .select({ id: allDayEvent.id })
    .from(allDayEvent)
    .where(eq(allDayEvent.userId, userId))
    .limit(1)
  const hasEvents = eventRows.length > 0

  return (
    <main className="min-h-screen bg-background py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Calendars
            </h1>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              {calendars.length === 0
                ? "No calendars yet. Sync to pull them from Google."
                : "Manage your synced calendars and keep them up to date."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <form action={syncCalendars}>
              <Button size="sm" type="submit">
                Sync calendars
              </Button>
            </form>
            {hasEvents ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/events">View events</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="divide-y divide-border">
          {calendars.length === 0 ? (
            <div className="py-8 text-muted-foreground">
              No calendars yet. Sync to pull them from Google.
            </div>
          ) : (
            calendars.map((item) => {
              const isSelected = selectedIds.has(item.calendarId)
              return (
                <div className="flex items-center justify-between py-6" key={item.id}>
                  <div className="flex items-center gap-4">
                    <CalendarSelectionCheckbox
                      action={setCalendarSelection}
                      calendarId={item.calendarId}
                      color={item.calendarColor}
                      defaultChecked={isSelected}
                    />
                    <div className="flex flex-col gap-1">
                      <h2 className="font-semibold text-foreground">
                        {item.calendarSummaryOverride ?? item.calendarSummary}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {item.calendarId}
                      </p>
                    </div>
                  </div>
                  {isSelected ? (
                    <form action={syncCalendarEvents}>
                      <input name="calendarId" type="hidden" value={item.calendarId} />
                      <Button size="sm" type="submit" variant="outline">
                        Sync events
                      </Button>
                    </form>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
