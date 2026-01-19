"use client"

interface CalendarSelectionCheckboxProps {
  calendarId: string
  defaultChecked: boolean
  color?: null | string
  action: (formData: FormData) => Promise<void>
}

export function CalendarSelectionCheckbox({
  action,
  calendarId,
  color,
  defaultChecked,
}: CalendarSelectionCheckboxProps) {
  return (
    <form action={action}>
      <input name="calendarId" type="hidden" value={calendarId} />
      <input
        aria-label="Toggle calendar selection"
        className="h-4 w-4 rounded-full border border-muted-foreground/40"
        defaultChecked={defaultChecked}
        name="selected"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        style={{ accentColor: color ?? "#3b82f6" }}
        type="checkbox"
      />
    </form>
  )
}
