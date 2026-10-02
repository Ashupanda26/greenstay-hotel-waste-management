/**
 * Short, readable reference shown to people instead of the full database ID,
 * e.g. "GS-3F9A1C". Pages still use the full ID in URLs.
 */
export function formatRequestReference(id: string): string {
  return `GS-${id.slice(-6).toUpperCase()}`
}

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

/** e.g. "2 Oct 2026, 14:05" */
export function formatDateTime(isoTimestamp: string): string {
  return dateTimeFormat.format(new Date(isoTimestamp))
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })

/** A date-only value ("YYYY-MM-DD"), e.g. "2 Oct 2026". Read as a local date, not UTC. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dateFormat.format(new Date(year, month - 1, day))
}

/** Today's local date as "YYYY-MM-DD", the format date inputs and the database use. */
export function todayIsoDate(): string {
  return new Date().toLocaleDateString('en-CA')
}
