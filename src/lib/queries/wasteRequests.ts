import { supabase } from '../supabase.ts'
import { calculatePriority } from '../businessRules.ts'
import type { Location, Priority, User, WasteRequest } from '../../types/database.ts'
import { getCollectionForRequest, type CollectionWithAssignee } from './collections.ts'
import { queryFailed } from './queryFailed.ts'

/** A request with the name of its location, for lists. */
export type WasteRequestListItem = WasteRequest & {
  location: Pick<Location, 'name'> | null
}

/** A request with its location and reporter, for the manager's queue. */
export type ManagerRequestListItem = WasteRequest & {
  location: Pick<Location, 'name'> | null
  reporter: Pick<User, 'name'> | null
}

/** A request with its location, reporter and collection, for the details page. */
export type WasteRequestDetails = WasteRequest & {
  location: Pick<Location, 'name' | 'area'> | null
  reporter: Pick<User, 'name' | 'department'> | null
  collection: CollectionWithAssignee | null
}

/** What staff enter when reporting waste. Priority and status are set by the system. */
export type NewWasteRequest = Pick<
  WasteRequest,
  'location_id' | 'reported_by' | 'waste_type' | 'waste_classification' | 'bin_level' | 'description'
>

/** Requests reported by one person, newest first. */
export async function listRequestsReportedBy(userId: string): Promise<WasteRequestListItem[]> {
  const { data, error } = await supabase
    .from('waste_requests')
    .select('*, location:locations(name)')
    .eq('reported_by', userId)
    .order('created_at', { ascending: false })
    .overrideTypes<WasteRequestListItem[], { merge: false }>()

  if (error) queryFailed('Loading requests', error)
  return data
}

/** Every request in the hotel, newest first, for the manager's queue and dashboard. */
export async function listManagerRequests(): Promise<ManagerRequestListItem[]> {
  const { data, error } = await supabase
    .from('waste_requests')
    .select('*, location:locations(name), reporter:users(name)')
    .order('created_at', { ascending: false })
    .overrideTypes<ManagerRequestListItem[], { merge: false }>()

  if (error) queryFailed('Loading requests', error)
  return data
}

/** One request with its location, reporter and collection, or null if it doesn't exist. */
export async function getRequestDetails(id: string): Promise<WasteRequestDetails | null> {
  const [{ data, error }, collection] = await Promise.all([
    supabase
      .from('waste_requests')
      .select('*, location:locations(name, area), reporter:users(name, department)')
      .eq('id', id)
      .maybeSingle(),
    getCollectionForRequest(id),
  ])

  // 22P02: the id in the URL isn't a valid UUID, so no such request can exist.
  if (error?.code === '22P02') return null
  if (error) queryFailed('Loading request', error)
  if (!data) return null
  return { ...(data as Omit<WasteRequestDetails, 'collection'>), collection }
}

/** A Waste Manager's override of the calculated priority. */
export async function updateRequestPriority(id: string, priority: Priority): Promise<void> {
  const { error } = await supabase.from('waste_requests').update({ priority }).eq('id', id)
  if (error) queryFailed('Changing priority', error)
}

/**
 * Saves a new waste report. Priority is always calculated from the bin level
 * and every new request starts as Reported.
 */
export async function createWasteRequest(input: NewWasteRequest): Promise<Pick<WasteRequest, 'id'>> {
  const { data, error } = await supabase
    .from('waste_requests')
    .insert({
      ...input,
      priority: calculatePriority(input.bin_level),
      status: 'Reported',
    })
    .select('id')
    .single()
    .overrideTypes<Pick<WasteRequest, 'id'>, { merge: false }>()

  if (error) queryFailed('Submitting request', error)
  return data
}
