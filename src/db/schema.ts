import { defineRelations } from "drizzle-orm"
import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

export const calendar = pgTable(
  "calendar",
  {
    calendarColor: text(),
    calendarColorId: text(),
    calendarForegroundColor: text(),
    calendarId: text().notNull(),
    calendarSummary: text().notNull(),
    calendarSummaryOverride: text(),
    createdAt: timestamp().defaultNow().notNull(),
    id: uuid().defaultRandom().primaryKey(),
    updatedAt: timestamp().defaultNow().notNull(),
    userId: text().notNull(),
  },
  (table) => {
    return [uniqueIndex("calendarUserIdCalendarIdUnique").on(table.userId, table.calendarId)];
  }
)

export const calendarSelection = pgTable(
  "calendarSelection",
  {
    calendarId: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    id: uuid().defaultRandom().primaryKey(),
    userId: text().notNull(),
  },
  (table) => {
    return [uniqueIndex("calendarSelectionUserIdCalendarIdUnique").on( table.userId, table.calendarId )];
  }
)

// endDate: The date, in the format "yyyy-mm-dd", if this is an all-day event.
// https://developers.google.com/workspace/calendar/api/v3/reference/events
export const allDayEvent = pgTable("allDayEvent", {
  calendarId: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  endDate: timestamp().notNull(),
  eventColor: text().notNull(),
  eventId: text().notNull(),
  eventName: text().notNull(),
  id: uuid().defaultRandom().primaryKey(),
  startDate: timestamp().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  userId: text().notNull(),
})

export const relations = defineRelations(
  { allDayEvent, calendar, calendarSelection },
  (relations) => {
    return {allDayEvent: {calendar: relations.one.calendar({from: [relations.allDayEvent.userId, relations.allDayEvent.calendarId], optional: false, to: [relations.calendar.userId, relations.calendar.calendarId]})}, calendar: {allDayEvents: relations.many.allDayEvent({from: [relations.calendar.userId, relations.calendar.calendarId], to: [relations.allDayEvent.userId, relations.allDayEvent.calendarId]}), selections: relations.many.calendarSelection({from: [relations.calendar.userId, relations.calendar.calendarId], to: [relations.calendarSelection.userId, relations.calendarSelection.calendarId]})}, calendarSelection: {calendar: relations.one.calendar({from: [relations.calendarSelection.userId, relations.calendarSelection.calendarId], optional: false, to: [relations.calendar.userId, relations.calendar.calendarId]})}};
  }
)
