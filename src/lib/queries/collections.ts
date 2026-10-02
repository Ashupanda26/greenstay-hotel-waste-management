import { supabase } from '../supabase.ts'
import type { Collection, Location, User, WasteRequest } from '../../types/database.ts'
import { queryFailed } from './queryFailed.ts'

// Collection workflow writes. Each step updates the collection and then its
// request, in that order. The publishable key cannot run both in one database
// transaction, so if the second write fails the page reloads and shows the
// actual state, and the manager can retry the step.
// Which steps are allowed is decided in businessRules.ts.

export type CollectionWithAssignee = Collection & {
  assignee: Pick<User, 'name'> | null
}

/** The collection for a request (the latest, if there were ever more than one), or null. */
export async function getCollectionForRequest(requestId: string): Promise<CollectionWithAssignee | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('*, assignee:users(name)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 22P02: not a valid UUID, so there is no such request.
  if (error?.code === '22P02') return null
  if (error) queryFailed('Loading collection', error)
  return data as CollectionWithAssignee | null
}

export type RecentCollection = Pick<Collection, 'id' | 'collection_status' | 'scheduled_date' | 'completed_at' | 'created_at'> & {
  assignee: Pick<User, 'name'> | null
  request: (Pick<WasteRequest, 'id'> & { location: Pick<Location, 'name'> | null }) | null
}

/** The most recently created collections, for the manager dashboard. */
export async function listRecentCollections(limit: number): Promise<RecentCollection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, collection_status, scheduled_date, completed_at, created_at, assignee:users(name), request:waste_requests(id, location:locations(name))')
    .order('created_at', { ascending: false })
    .limit(limit)
    .overrideTypes<RecentCollection[], { merge: false }>()

  if (error) queryFailed('Loading collections', error)
  return data
}

async function updateRequestStatus(requestId: string, changes: Record<string, unknown>, action: string) {
  const { error } = await supabase.from('waste_requests').update(changes).eq('id', requestId)
  if (error) queryFailed(action, error)
}

async function updateCollection(collectionId: string, changes: Record<string, unknown>, action: string) {
  const { error } = await supabase.from('collections').update(changes).eq('id', collectionId)
  if (error) queryFailed(action, error)
}

/**
 * Assigns a collector. Reuses the request's existing collection if it has one,
 * so a request never gets a duplicate collection. Request becomes Assigned.
 */
export async function assignCollection(requestId: string, assigneeId: string): Promise<void> {
  const action = 'Assigning collection'
  // Checked here, not just in the page, so a stale screen can't create a duplicate.
  const existing = await getCollectionForRequest(requestId)

  if (existing) {
    await updateCollection(existing.id, { assigned_to: assigneeId, collection_status: 'Pending' }, action)
  } else {
    const { error } = await supabase
      .from('collections')
      .insert({ request_id: requestId, assigned_to: assigneeId, collection_status: 'Pending' })
    if (error) queryFailed(action, error)
  }

  await updateRequestStatus(requestId, { status: 'Assigned' }, action)
}

/** Sets the collection date ("YYYY-MM-DD"). Collection and request become Scheduled. */
export async function scheduleCollection(requestId: string, collectionId: string, date: string): Promise<void> {
  const action = 'Scheduling collection'
  await updateCollection(collectionId, { scheduled_date: date, collection_status: 'Scheduled' }, action)
  await updateRequestStatus(requestId, { status: 'Scheduled' }, action)
}

/** Collection and request become In Progress. */
export async function startCollection(requestId: string, collectionId: string): Promise<void> {
  const action = 'Starting collection'
  await updateCollection(collectionId, { collection_status: 'In Progress' }, action)
  await updateRequestStatus(requestId, { status: 'In Progress' }, action)
}

/** Collection and request become Completed, both stamped with the same completion time. */
export async function completeCollection(requestId: string, collectionId: string): Promise<void> {
  const action = 'Completing collection'
  const completedAt = new Date().toISOString()
  await updateCollection(collectionId, { collection_status: 'Completed', completed_at: completedAt }, action)
  await updateRequestStatus(requestId, { status: 'Completed', completed_at: completedAt }, action)
}

/** Cancels the request, and its collection if it has one. */
export async function cancelCollection(requestId: string, collectionId: string | null): Promise<void> {
  const action = 'Cancelling request'
  if (collectionId) await updateCollection(collectionId, { collection_status: 'Cancelled' }, action)
  await updateRequestStatus(requestId, { status: 'Cancelled' }, action)
}
