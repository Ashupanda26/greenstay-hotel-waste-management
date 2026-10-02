import { supabase } from '../supabase.ts'
import type { AnalyticsRequest } from '../analytics.ts'
import { listLocations, type LocationOption } from './locations.ts'
import { queryFailed } from './queryFailed.ts'

export type AnalyticsData = {
  requests: AnalyticsRequest[]
  locations: LocationOption[]
  /** When the data was loaded. Date ranges and "today" are measured from this moment. */
  loadedAt: Date
}

/**
 * Every request with its location name and collection statuses, in one read.
 * All filtering and counting then happens in lib/analytics.ts, so changing a
 * filter doesn't need another database call. That suits this small demo
 * dataset; a larger system would push the date and location filters into this
 * query (e.g. .gte('created_at', start)) or aggregate in the database.
 */
export async function getAnalyticsRequests(): Promise<AnalyticsRequest[]> {
  const { data, error } = await supabase
    .from('waste_requests')
    .select(
      'id, location_id, waste_type, waste_classification, priority, status, created_at, completed_at, location:locations(name), collections(collection_status)',
    )
    .order('created_at')
    .overrideTypes<AnalyticsRequest[], { merge: false }>()

  if (error) queryFailed('Loading analytics', error)
  return data
}

/** Requests plus the location list for the filter, loaded together. */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [requests, locations] = await Promise.all([getAnalyticsRequests(), listLocations()])
  return { requests, locations, loadedAt: new Date() }
}
