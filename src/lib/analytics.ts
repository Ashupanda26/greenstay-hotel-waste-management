// Analytics calculations for the Waste Manager.
//
// Every number on the Analytics page is calculated here from the requests
// loaded from Supabase (see queries/analytics.ts). These are plain functions
// with no database access, so each calculation can be checked on its own.
//
// Definitions used throughout:
// - A request's date is when it was reported (created_at), in the viewer's local time.
// - "Open" means not Completed or Cancelled (isOpenRequest in businessRules.ts).
// - Percentages are shares of the filtered requests, so they change with the filters.

import { isOpenRequest } from './businessRules.ts'
import {
  COLLECTION_STATUSES,
  PRIORITIES,
  WASTE_CLASSIFICATIONS,
  WASTE_TYPES,
  type Collection,
  type CollectionStatus,
  type Location,
  type Priority,
  type WasteClassification,
  type WasteRequest,
  type WasteType,
} from '../types/database.ts'

/** One request as loaded for analytics: the fields used, its location name and its collections. */
export type AnalyticsRequest = Pick<
  WasteRequest,
  | 'id'
  | 'location_id'
  | 'waste_type'
  | 'waste_classification'
  | 'priority'
  | 'status'
  | 'created_at'
  | 'completed_at'
> & {
  location: Pick<Location, 'name'> | null
  collections: Pick<Collection, 'collection_status'>[]
}

// -----------------------------------------------------------------------------
// Filters
// -----------------------------------------------------------------------------

export const DATE_RANGES = [
  { value: 'last7', label: 'Last 7 days', days: 7 },
  { value: 'last30', label: 'Last 30 days', days: 30 },
  { value: 'last90', label: 'Last 90 days', days: 90 },
  { value: 'all', label: 'All time', days: null },
] as const
export type DateRange = (typeof DATE_RANGES)[number]['value']

export type AnalyticsFilters = {
  range: DateRange
  /** '' means all locations. */
  locationId: string
  wasteType: WasteType | ''
  classification: WasteClassification | ''
  priority: Priority | ''
}

export const defaultAnalyticsFilters: AnalyticsFilters = {
  range: 'last30',
  locationId: '',
  wasteType: '',
  classification: '',
  priority: '',
}

/** "YYYY-MM-DD" for a moment, in local time. */
export function localDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA')
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/**
 * First moment included in a date range, or null for all time.
 * Ranges are whole calendar days including today: "Last 7 days" is today and the 6 days before.
 */
export function rangeStart(range: DateRange, now: Date): Date | null {
  const days = DATE_RANGES.find((r) => r.value === range)?.days ?? null
  return days === null ? null : addDays(startOfLocalDay(now), -(days - 1))
}

export function filterAnalyticsRequests(
  requests: AnalyticsRequest[],
  filters: AnalyticsFilters,
  now: Date,
): AnalyticsRequest[] {
  const start = rangeStart(filters.range, now)
  return requests.filter(
    (r) =>
      (!start || new Date(r.created_at) >= start) &&
      (!filters.locationId || r.location_id === filters.locationId) &&
      (!filters.wasteType || r.waste_type === filters.wasteType) &&
      (!filters.classification || r.waste_classification === filters.classification) &&
      (!filters.priority || r.priority === filters.priority),
  )
}

// -----------------------------------------------------------------------------
// KPIs
// -----------------------------------------------------------------------------

export type AnalyticsKpis = {
  totalRequests: number
  highPriority: number
  recyclable: number
  nonRecyclable: number
  /** Collections with status Completed, belonging to the filtered requests. */
  completedCollections: number
  /** Requests not yet Completed or Cancelled. */
  openRequests: number
}

export function calculateKpis(requests: AnalyticsRequest[]): AnalyticsKpis {
  return {
    totalRequests: requests.length,
    highPriority: requests.filter((r) => r.priority === 'High').length,
    recyclable: requests.filter((r) => r.waste_classification === 'Recyclable').length,
    nonRecyclable: requests.filter((r) => r.waste_classification === 'Non-Recyclable').length,
    completedCollections: requests
      .flatMap((r) => r.collections)
      .filter((c) => c.collection_status === 'Completed').length,
    openRequests: requests.filter((r) => isOpenRequest(r.status)).length,
  }
}

/** Share of a total as a percentage (0-100). Only call with total > 0. */
export function percentOf(count: number, total: number): number {
  return (count / total) * 100
}

// -----------------------------------------------------------------------------
// Breakdowns
// -----------------------------------------------------------------------------

export type WasteTypeSummary = { wasteType: WasteType; count: number; percent: number }
export type ClassificationSummary = { classification: WasteClassification; count: number; percent: number }
export type PrioritySummary = { priority: Priority; count: number; percent: number }

/** All six waste types, most reported first (ties keep the standard order). */
export function summariseByWasteType(requests: AnalyticsRequest[]): WasteTypeSummary[] {
  const total = requests.length
  return WASTE_TYPES.map((wasteType) => {
    const count = requests.filter((r) => r.waste_type === wasteType).length
    return { wasteType, count, percent: total ? percentOf(count, total) : 0 }
  }).sort((a, b) => b.count - a.count)
}

export function summariseByClassification(requests: AnalyticsRequest[]): ClassificationSummary[] {
  const total = requests.length
  return WASTE_CLASSIFICATIONS.map((classification) => {
    const count = requests.filter((r) => r.waste_classification === classification).length
    return { classification, count, percent: total ? percentOf(count, total) : 0 }
  })
}

/** Low, Medium, High in that order. */
export function summariseByPriority(requests: AnalyticsRequest[]): PrioritySummary[] {
  const total = requests.length
  return PRIORITIES.map((priority) => {
    const count = requests.filter((r) => r.priority === priority).length
    return { priority, count, percent: total ? percentOf(count, total) : 0 }
  })
}

export type LocationSummary = {
  locationId: string
  name: string
  total: number
  open: number
  highPriority: number
  recyclable: number
  nonRecyclable: number
  /** Requests with status Completed. */
  completed: number
}

/** One row per location that has matching requests, busiest first (ties alphabetical). */
export function summariseByLocation(requests: AnalyticsRequest[]): LocationSummary[] {
  const byLocation = new Map<string, LocationSummary>()
  for (const r of requests) {
    const row = byLocation.get(r.location_id) ?? {
      locationId: r.location_id,
      name: r.location?.name ?? 'Unknown location',
      total: 0,
      open: 0,
      highPriority: 0,
      recyclable: 0,
      nonRecyclable: 0,
      completed: 0,
    }
    row.total++
    if (isOpenRequest(r.status)) row.open++
    if (r.priority === 'High') row.highPriority++
    if (r.waste_classification === 'Recyclable') row.recyclable++
    else row.nonRecyclable++
    if (r.status === 'Completed') row.completed++
    byLocation.set(r.location_id, row)
  }
  return [...byLocation.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
}

// -----------------------------------------------------------------------------
// Collections and completion time
// -----------------------------------------------------------------------------

export type CollectionSummary = {
  byStatus: { status: CollectionStatus; count: number }[]
  total: number
  completed: number
  /** Completed / all collections x 100, or null when there are no collections. */
  completionRate: number | null
}

export function summariseCollections(requests: AnalyticsRequest[]): CollectionSummary {
  const collections = requests.flatMap((r) => r.collections)
  const byStatus = COLLECTION_STATUSES.map((status) => ({
    status,
    count: collections.filter((c) => c.collection_status === status).length,
  }))
  const completed = byStatus.find((s) => s.status === 'Completed')?.count ?? 0
  return {
    byStatus,
    total: collections.length,
    completed,
    completionRate: collections.length > 0 ? percentOf(completed, collections.length) : null,
  }
}

export type CompletionTime = { averageHours: number; requestCount: number }

/** Average time from report to completion for Completed requests, or null if there are none. */
export function averageCompletionTime(requests: AnalyticsRequest[]): CompletionTime | null {
  const durations = requests
    .filter((r) => r.status === 'Completed' && r.completed_at)
    .map((r) => (new Date(r.completed_at as string).getTime() - new Date(r.created_at).getTime()) / 3_600_000)
  if (durations.length === 0) return null
  return {
    averageHours: durations.reduce((sum, hours) => sum + hours, 0) / durations.length,
    requestCount: durations.length,
  }
}

// -----------------------------------------------------------------------------
// Trend
// -----------------------------------------------------------------------------

export type TrendPoint = {
  /** First day of the period, "YYYY-MM-DD". */
  periodStart: string
  label: string
  count: number
}

export type TrendSeries = { grouping: 'day' | 'week'; points: TrendPoint[] }

/** Periods longer than this are grouped by week, so the chart stays readable. */
const MAX_DAILY_POINTS = 31

const dayLabel = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

/** Monday of the week containing `date` (local time). */
function startOfWeek(date: Date): Date {
  const day = startOfLocalDay(date)
  const sinceMonday = (day.getDay() + 6) % 7
  return addDays(day, -sinceMonday)
}

/**
 * Requests per day (or per week, Monday start) from the start of the range to today.
 * Every period is included, so days with no reports show as zero rather than being skipped.
 * For "All time" the series starts on the day of the earliest matching request.
 */
export function buildTrend(requests: AnalyticsRequest[], range: DateRange, now: Date): TrendSeries {
  const today = startOfLocalDay(now)
  let start = rangeStart(range, now)
  if (!start) {
    if (requests.length === 0) return { grouping: 'day', points: [] }
    const earliest = Math.min(...requests.map((r) => new Date(r.created_at).getTime()))
    start = startOfLocalDay(new Date(earliest))
  }

  const spanDays = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1
  const grouping = spanDays > MAX_DAILY_POINTS ? 'week' : 'day'
  const periodOf = (date: Date) => (grouping === 'week' ? startOfWeek(date) : startOfLocalDay(date))

  const counts = new Map<string, number>()
  for (const r of requests) {
    const key = localDateKey(periodOf(new Date(r.created_at)))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const points: TrendPoint[] = []
  for (let period = periodOf(start); period <= today; period = addDays(period, grouping === 'week' ? 7 : 1)) {
    const key = localDateKey(period)
    points.push({
      periodStart: key,
      label: grouping === 'week' ? `w/c ${dayLabel.format(period)}` : dayLabel.format(period),
      count: counts.get(key) ?? 0,
    })
  }
  return { grouping, points }
}

// -----------------------------------------------------------------------------
// Operational insights (rule-based, from the filtered data only)
// -----------------------------------------------------------------------------

/** Below this many requests, shares and "most common" statements aren't meaningful. */
export const MIN_REQUESTS_FOR_INSIGHTS = 5
/** Below this many completed requests, an average completion time isn't meaningful. */
export const MIN_COMPLETED_FOR_AVERAGE = 3

function formatShare(count: number, total: number): string {
  return formatPercent(percentOf(count, total))
}

function joinNames(names: string[]): string {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

export function formatDuration(hours: number): string {
  if (hours < 48) {
    const rounded = Math.round(hours)
    return `${rounded} hour${rounded === 1 ? '' : 's'}`
  }
  return `${(hours / 24).toFixed(1)} days`
}

/**
 * Plain statements of fact about the filtered requests. Each is only produced
 * when the data supports it; an empty list means there isn't enough data.
 */
export function generateInsights(requests: AnalyticsRequest[]): string[] {
  const total = requests.length
  if (total < MIN_REQUESTS_FOR_INSIGHTS) return []
  const insights: string[] = []

  const locations = summariseByLocation(requests)
  const topLocations = locations.filter((l) => l.total === locations[0].total)
  if (topLocations.length === 1) {
    const top = topLocations[0]
    insights.push(`${top.name} accounts for ${formatShare(top.total, total)} of filtered waste requests (${top.total} of ${total}).`)
  } else {
    insights.push(
      `${joinNames(topLocations.map((l) => l.name))} have the most waste requests, with ${topLocations[0].total} each.`,
    )
  }

  const types = summariseByWasteType(requests)
  const topTypes = types.filter((t) => t.count === types[0].count)
  insights.push(
    topTypes.length === 1
      ? `${topTypes[0].wasteType} is the most frequently reported waste type (${topTypes[0].count} of ${total} requests).`
      : `${joinNames(topTypes.map((t) => t.wasteType))} are the most frequently reported waste types, with ${topTypes[0].count} requests each.`,
  )

  const high = requests.filter((r) => r.priority === 'High').length
  insights.push(`High-priority requests represent ${formatShare(high, total)} of filtered requests (${high} of ${total}).`)

  const recyclable = requests.filter((r) => r.waste_classification === 'Recyclable').length
  insights.push(`Recyclable requests represent ${formatShare(recyclable, total)} of filtered requests (${recyclable} of ${total}).`)

  const urgentLocations = locations.filter((l) =>
    requests.some((r) => r.location_id === l.locationId && r.priority === 'High' && isOpenRequest(r.status)),
  )
  insights.push(
    urgentLocations.length === 0
      ? 'No locations currently have open high-priority requests in this selection.'
      : `${urgentLocations.length} location${urgentLocations.length === 1 ? ' currently has' : 's currently have'} open high-priority requests: ${joinNames(urgentLocations.map((l) => l.name))}.`,
  )

  const completion = averageCompletionTime(requests)
  if (completion && completion.requestCount >= MIN_COMPLETED_FOR_AVERAGE) {
    insights.push(
      `Completed requests took ${formatDuration(completion.averageHours)} on average from report to completion (${completion.requestCount} requests).`,
    )
  }

  return insights
}

/** A percentage for display, e.g. "34%". */
export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`
}
