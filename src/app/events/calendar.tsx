"use client"

import { toPng } from "html-to-image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { IEvent } from './IEvent'

interface CalendarProps {
  events?: IEvent[]
  showAllRange?: null | { end: Date; start: Date }
  onExitShowAll?: () => void
  onShowAll?: () => void
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const sampleEvents: IEvent[] = [
  {
    color: "bg-blue-500",
    endDate: new Date(2026, 0, 14),
    id: "1",
    startDate: new Date(2026, 0, 8),
    title: "Company Retreat",
  },
  {
    color: "bg-emerald-500",
    endDate: new Date(2026, 0, 28),
    id: "2",
    startDate: new Date(2026, 0, 26),
    title: "Product Launch",
  },
  {
    color: "bg-amber-500",
    endDate: new Date(2026, 0, 22),
    id: "3",
    startDate: new Date(2026, 0, 19),
    title: "Conference",
  },
  {
    color: "bg-rose-500",
    endDate: new Date(2026, 0, 30),
    id: "4",
    startDate: new Date(2026, 0, 22),
    title: "Marketing Campaign",
  },
  {
    color: "bg-indigo-500",
    endDate: new Date(2026, 0, 7),
    id: "5",
    startDate: new Date(2026, 0, 5),
    title: "Design Workshop",
  },
  {
    color: "bg-cyan-500",
    endDate: new Date(2026, 1, 5),
    id: "6",
    startDate: new Date(2026, 1, 2),
    title: "Annual Planning",
  },
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isDateInRange(date: Date, startDate: Date, endDate: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  return d >= start && d <= end
}

function isStartOfEvent(date: Date, event: IEvent) {
  return isSameDay(date, event.startDate)
}

function isEndOfEvent(date: Date, event: IEvent) {
  return isSameDay(date, event.endDate)
}

export function Calendar({ events = sampleEvents, onExitShowAll, onShowAll, showAllRange = null }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 0, 1))
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    () => new Set(),
  )
  const calendarRef = useRef<HTMLDivElement | null>(null)

  const showAllData = useMemo(() => {
    if (!showAllRange) return null

    const start = new Date(showAllRange.start.getFullYear(), showAllRange.start.getMonth(), 1)
    const end = new Date(showAllRange.end.getFullYear(), showAllRange.end.getMonth(), 1)
    const expanded = new Set<string>()

    const monthDelta =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())

    for (let offset = 1; offset <= monthDelta; offset += 1) {
      const date = new Date(start.getFullYear(), start.getMonth() + offset, 1)
      expanded.add(`${date.getFullYear()}-${date.getMonth()}`)
    }

    return { expanded, start }
  }, [showAllRange])

  const activeDate = showAllData?.start ?? currentDate
  const activeExpandedMonths = showAllData?.expanded ?? expandedMonths

  const year = activeDate.getFullYear()
  const month = activeDate.getMonth()

  const exitShowAll = () => {
    if (showAllRange) {
      onExitShowAll?.()
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const prevMonth = () => {
    exitShowAll()
    setCurrentDate(new Date(year, month - 1, 1))
    setExpandedMonths(new Set())
  }

  const nextMonth = () => {
    exitShowAll()
    setCurrentDate(new Date(year, month + 1, 1))
    setExpandedMonths(new Set())
  }

  const goToToday = () => {
    exitShowAll()
    setCurrentDate(new Date())
    setExpandedMonths(new Set())
  }

  const expandMonth = (monthKey: string) => {
    exitShowAll()
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      next.add(monthKey)
      return next
    })
  }

  // Build calendar grid with expanded months
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDays = getDaysInMonth(year, month - 1)
      days.push(new Date(year, month - 1, prevMonthDays - firstDayOfMonth + i + 1))
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    // Add days from next month to complete the grid (at least one week)
    const lastDayOfMonth = new Date(year, month, daysInMonth)
    const lastDayWeekday = lastDayOfMonth.getDay()
    const daysToCompleteWeek = lastDayWeekday === 6 ? 0 : 6 - lastDayWeekday
    
    for (let i = 1; i <= daysToCompleteWeek; i++) {
      days.push(new Date(year, month + 1, i))
    }

    // Check for expanded months and add their full days
    let currentEndDate = new Date(year, month + 1, daysToCompleteWeek || 0)
    
    // Sort expanded months by date
    const sortedExpandedMonths = [...activeExpandedMonths].toSorted()
    
    for (const monthKey of sortedExpandedMonths) {
      const [expYear, expMonth] = monthKey.split("-").map(Number)
      const expDate = new Date(expYear, expMonth, 1)
      
      // Only add if this month comes after the current end
      if (expDate > currentEndDate || (expDate.getMonth() === currentEndDate.getMonth() && expDate.getFullYear() === currentEndDate.getFullYear())) {
        const expDaysInMonth = getDaysInMonth(expYear, expMonth)
        const lastAddedDay = days.at(-1)
        const startDay = lastAddedDay ? lastAddedDay.getDate() + 1 : 1
        
        // If we're in the same month, continue from where we left off
        if (lastAddedDay?.getMonth() === expMonth && lastAddedDay.getFullYear() === expYear) {
          for (let day = startDay; day <= expDaysInMonth; day++) {
            days.push(new Date(expYear, expMonth, day))
          }
        } else {
          // Add all days of the expanded month
          for (let day = 1; day <= expDaysInMonth; day++) {
            days.push(new Date(expYear, expMonth, day))
          }
        }
        
        // Complete the last week of this month
        const expLastDay = new Date(expYear, expMonth, expDaysInMonth)
        const expLastDayWeekday = expLastDay.getDay()
        const expDaysToComplete = expLastDayWeekday === 6 ? 0 : 6 - expLastDayWeekday
        
        for (let i = 1; i <= expDaysToComplete; i++) {
          days.push(new Date(expYear, expMonth + 1, i))
        }
        
        currentEndDate = new Date(expYear, expMonth + 1, expDaysToComplete || 0)
      }
    }

    return days
  }, [year, month, daysInMonth, firstDayOfMonth, activeExpandedMonths])
  const nextMonthToExpand = useMemo(() => {
    const lastDay = calendarDays.at(-1)
    if (!lastDay) return null

    const isMonthFullyDisplayed = (yearToCheck: number, monthToCheck: number) => {
      const lastDayOfMonth = getDaysInMonth(yearToCheck, monthToCheck)
      return calendarDays.some((d) => {
        if (!d) return false
        return d.getFullYear() === yearToCheck
          && d.getMonth() === monthToCheck
          && d.getDate() === lastDayOfMonth
      })
    }

    const lastMonthKey = `${lastDay.getFullYear()}-${lastDay.getMonth()}`
    if (!isMonthFullyDisplayed(lastDay.getFullYear(), lastDay.getMonth())) {
      return activeExpandedMonths.has(lastMonthKey) ? null : { monthKey: lastMonthKey }
    }

    const nextMonthDate = new Date(lastDay.getFullYear(), lastDay.getMonth() + 1, 1)
    const monthKey = `${nextMonthDate.getFullYear()}-${nextMonthDate.getMonth()}`

    if (activeExpandedMonths.has(monthKey)) return null

    return { monthKey }
  }, [calendarDays, activeExpandedMonths])

  // Get events for each row (week)
  const getEventsForWeek = (weekDays: (Date | null)[]) => {
    return events
      .filter((event) => {
        return weekDays.some((day) => {
          return day && isDateInRange(day, event.startDate, event.endDate);
        });
      })
      .toSorted((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }

  // Split calendar into weeks
  const weeks = useMemo(() => {
    const result: (Date | null)[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7))
    }
    return result
  }, [calendarDays])

  const today = new Date()

  const handleCopySvg = async () => {
    const target = calendarRef.current
    if (!target) return

    const toastId = toast.loading("Copying PNG...")

    try {
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 1,
      })
      if (!dataUrl) {
        throw new Error("Failed to generate PNG.")
      }

      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const clipboardItem = new ClipboardItem({ [blob.type]: blob })
      await navigator.clipboard.write([clipboardItem])

      toast.success("PNG copied to clipboard.", { id: toastId })
    } catch {
      toast.error("Could not copy PNG.", { id: toastId })
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          {onShowAll && (
            <>
              <Button onClick={onShowAll} size="sm" variant="outline">
                Show All
              </Button>
              <Button onClick={handleCopySvg} size="sm" variant="outline">
                Copy PNG
              </Button>
            </>
          )}
          <Button className="text-xs bg-transparent" onClick={goToToday} size="sm" variant="outline">
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button className="h-8 w-8" onClick={prevMonth} size="icon" variant="ghost">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button className="h-8 w-8" onClick={nextMonth} size="icon" variant="ghost">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>

      <div ref={calendarRef}>
        {/* Calendar Grid */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/50">
            {DAYS_OF_WEEK.map((day) => {
              return <div className="py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider" key={day}>
                  {day}
                </div>;
            })}
          </div>

          {/* Calendar weeks */}
          {weeks.map((week, weekIndex) => {
            const weekEvents = getEventsForWeek(week)
            const weekRowMinHeight = Math.max(60, 8 + (weekEvents.length * 28) + 12)
            
            // Check if any day in this week is the 1st of a month
            const firstOfMonthDay = week.find((day) => day?.getDate() === 1)
            const monthLabel = firstOfMonthDay
              ? firstOfMonthDay.toLocaleString("default", { month: "long", year: "numeric" })
              : null
            const firstOfMonthIndex = firstOfMonthDay ? week.findIndex((day) => {
              return day?.getDate() === 1;
            }) : -1
            
            return (
              // eslint-disable-next-line react-x/no-array-index-key
              <div className="border-b border-border last:border-b-0" key={weekIndex}>
                {/* Month label row - shown when week contains 1st of month */}
                {monthLabel && (
                  <div className="grid grid-cols-7 border-b border-border bg-zinc-900">
                    {week.map((_, idx) => {
                      return <div
                          className={cn(
                            "h-8 border-r border-zinc-700 last:border-r-0 flex items-center",
                            idx === firstOfMonthIndex && "px-2"
                          )}
                          // eslint-disable-next-line react-x/no-array-index-key
                          key={idx}
                        >
                          {idx === firstOfMonthIndex && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{monthLabel}</span>
                            </div>
                          )}
                        </div>;
                    })}
                  </div>
                )}

                {/* Day numbers row */}
                <div className="grid grid-cols-7">
                  {week.map((day, dayIndex) => {
                    const isCurrentMonth = day?.getMonth() === month
                    const isToday = day && isSameDay(day, today)

                    return (
                      <div
                        className={cn(
                          "h-10 p-2 border-r border-border last:border-r-0",
                          !isCurrentMonth && "bg-muted/30"
                        )}
                        // eslint-disable-next-line react-x/no-array-index-key
                        key={dayIndex}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full",
                            isToday && "bg-primary text-primary-foreground font-medium",
                            !isCurrentMonth && "text-muted-foreground",
                            isCurrentMonth && !isToday && "text-foreground"
                          )}
                        >
                          {day?.getDate()}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Events row */}
                <div
                  className="relative min-h-[60px] grid grid-cols-7"
                  style={{ minHeight: weekRowMinHeight }}
                >
                  {week.map((day, dayIndex) => {
                    const isCurrentMonth = day?.getMonth() === month
                    return (
                      <div
                        className={cn(
                          "border-r border-border last:border-r-0 h-full min-h-[60px]",
                          !isCurrentMonth && "bg-muted/30"
                        )}
                        // eslint-disable-next-line react-x/no-array-index-key
                        key={dayIndex}
                      />
                    )
                  })}

                  {/* Event bars */}
                  <div className="absolute inset-0 pointer-events-none">
                    {weekEvents.map((event, eventIndex) => {
                      // Check if this event appears in this week
                      const appearsInWeek = week.some((day) => {
                        return day && isDateInRange(day, event.startDate, event.endDate);
                      })
                      if (!appearsInWeek) return null

                      // Recalculate actual start and end columns
                      let actualStart = -1
                      let actualEnd = -1

                      for (const [idx, day] of week.entries()) {
                        if (day && isDateInRange(day, event.startDate, event.endDate)) {
                          if (actualStart === -1) actualStart = idx
                          actualEnd = idx
                        }
                      }

                      if (actualStart === -1) return null

                      const width = ((actualEnd - actualStart + 1) / 7) * 100
                      const left = (actualStart / 7) * 100

                      // Determine if this is start/end of event or continues from/to another week
                      const startsThisWeek = week.some((day) => {
                        return day && isStartOfEvent(day, event);
                      })
                      const endsThisWeek = week.some((day) => {
                        return day && isEndOfEvent(day, event);
                      })

                      return (
                        <div
                          className={cn(
                            "absolute h-6 flex items-center px-2 text-xs font-medium text-white truncate pointer-events-auto cursor-pointer hover:opacity-90 transition-opacity",
                            event.color,
                            startsThisWeek && "rounded-l-md ml-1",
                            endsThisWeek && "rounded-r-md mr-1",
                            !startsThisWeek && "rounded-l-none -ml-px",
                            !endsThisWeek && "rounded-r-none -mr-px"
                          )}
                          key={event.id}
                          style={{
                            left: `calc(${left}% + ${startsThisWeek ? 4 : 0}px)`,
                            top: `${8 + eventIndex * 28}px`,
                            width: `calc(${width}% - ${(startsThisWeek ? 4 : 0) + (endsThisWeek ? 4 : 0)}px)`,
                          }}
                          title={`${event.title}: ${event.startDate.toLocaleDateString()} - ${event.endDate.toLocaleDateString()}`}
                        >
                          {startsThisWeek && event.title}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trailing month header - show next month if not already visible */}
        {/* eslint-disable-next-line react-x/jsx-no-iife */}
        {(() => {
          const lastDay = calendarDays.at(-1)
          if (!lastDay) return null
          
          const lastDayMonth = lastDay.getMonth()
          const lastDayYear = lastDay.getFullYear()
          const lastDayOfDisplayedMonth = getDaysInMonth(lastDayYear, lastDayMonth)
          
          // If the last day shown is NOT the last day of its month, we need to show the next month header
          // Also check if the last day IS the last day of its month but on a Saturday - then no trailing header needed
          const isLastDayOfMonth = lastDay.getDate() === lastDayOfDisplayedMonth
          const isOnSaturday = lastDay.getDay() === 6
          
          // Only show trailing header if:
          // 1. The last displayed day is a Saturday (end of week)
          // 2. AND it's the last day of its month
          // 3. Then we need to show the NEXT month's header
          if (isOnSaturday && isLastDayOfMonth) {
            const nextMonthDate = new Date(lastDayYear, lastDayMonth + 1, 1)
            const nextMonthLabel = nextMonthDate.toLocaleString("default", { month: "long", year: "numeric" })
            return (
              <div className="grid grid-cols-7 bg-zinc-900 border-t border-zinc-700">
                <div className="h-8 border-r border-zinc-700 flex items-center px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{nextMonthLabel}</span>
                  </div>
                </div>
                {[1, 2, 3, 4, 5, 6].map((idx) => {
                  return <div className="h-8 border-r border-zinc-700 last:border-r-0" key={idx} />;
                })}
              </div>
            )
          }
          
          return null
        })()}
      </div>

      {nextMonthToExpand && (
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={() => {
              expandMonth(nextMonthToExpand.monthKey)
            }}
            variant="outline"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
