import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

import { allDayEvent } from "@/db/schema"
import { pg } from "@/pg"

import type { IEvent } from './IEvent'

import { EventsView } from "./EventsView"

export default async function EventsPage() {
  const { userId } = await auth()
  if (!userId) {
    return (
      <main className="min-h-screen bg-background py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Events
          </h1>
          <p className="text-muted-foreground">Sign in to view your events.</p>
        </div>
      </main>
    )
  }

  const dbEvents = await pg
    .select()
    .from(allDayEvent)
    .where(eq(allDayEvent.userId, userId))
    .orderBy(allDayEvent.startDate)

  const events: IEvent[] = dbEvents.map((event) => {
    return {
      color: event.eventColor,
      endDate: event.endDate,
      id: event.id,
      startDate: event.startDate,
      title: event.eventName,
    }
  })

  return (
    <main className="min-h-screen bg-background py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-[calc(56rem+200px)] mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Events
        </h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          All synced events for your account.
        </p>

        <EventsView events={events} />
      </div>
    </main>
  )
}
