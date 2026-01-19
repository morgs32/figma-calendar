
"use client"

import { useState } from "react"

import { Calendar } from "@/app/events/calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { IEvent } from './IEvent'

export function EventsView({ events }: { events: IEvent[] }) {
  const [showAllRange, setShowAllRange] = useState<null | { end: Date; start: Date; }>(null)

  const handleShowAll = () => {
    if (events.length === 0) return

    let minTime = Number.POSITIVE_INFINITY
    let maxTime = Number.NEGATIVE_INFINITY

    for (const event of events) {
      const startTime = new Date(event.startDate).getTime()
      const endTime = new Date(event.endDate).getTime()
      if (startTime < minTime) minTime = startTime
      if (endTime > maxTime) maxTime = endTime
    }

    if (!Number.isFinite(minTime) || !Number.isFinite(maxTime)) return

    setShowAllRange({ end: new Date(maxTime), start: new Date(minTime) })
  }

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <div className="py-8 text-muted-foreground">
          No events yet. Sync a calendar to pull events.
        </div>
      ) : (
        <Calendar
          events={events}
          onExitShowAll={() => { setShowAllRange(null) }}
          onShowAll={handleShowAll}
          showAllRange={showAllRange}
        />
      )}

      <div>
        {events.length === 0 ? (
          <div className="py-8 text-muted-foreground">
            No events yet. Sync a calendar to pull events.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Dates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const startDate = new Date(event.startDate).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                const endDate = new Date(event.endDate).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                return (
                  <TableRow key={event.id}>
                    <TableCell className="min-w-0">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-2 w-2 rounded-full ${event.color}`} />
                        <span className="text-sm font-medium text-foreground truncate">
                          {event.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {startDate} → {endDate}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
