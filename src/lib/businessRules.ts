import type { Collection, Priority, RequestStatus } from '../types/database.ts'

/**
 * Priority rule: a request's default priority comes from how full the bin is.
 *
 *   bin level  0-49  -> Low
 *   bin level 50-89  -> Medium
 *   bin level 90-100 -> High
 *
 * Staff never choose priority. The app calls this when a request is reported
 * and stores the result. A Waste Manager may later override the stored
 * priority, which is why the database only checks that priority is
 * Low/Medium/High and does not tie it to bin_level.
 *
 * This is the only place the rule lives. Use this function rather than
 * repeating the thresholds in components.
 *
 * @param binLevel Bin fullness as a whole-number percentage, 0-100.
 * @throws RangeError if binLevel is not a whole number from 0 to 100.
 */
export function calculatePriority(binLevel: number): Priority {
  if (!Number.isInteger(binLevel) || binLevel < 0 || binLevel > 100) {
    throw new RangeError(`Bin level must be a whole number from 0 to 100, got ${binLevel}.`)
  }

  if (binLevel >= 90) return 'High'
  if (binLevel >= 50) return 'Medium'
  return 'Low'
}

/** A request is open until it is Completed or Cancelled. */
export function isOpenRequest(status: RequestStatus): boolean {
  return status !== 'Completed' && status !== 'Cancelled'
}

// -----------------------------------------------------------------------------
// Collection workflow
//
//   Reported -> Assigned -> Scheduled -> In Progress -> Completed
//   Any open request can instead be Cancelled.
//
// Each step moves the request and its collection together:
//   Assign    creates (or reassigns) the collection as Pending  -> request Assigned
//   Schedule  sets a date, collection Scheduled                 -> request Scheduled
//   Start     collection In Progress                            -> request In Progress
//   Complete  collection Completed, completed_at set            -> request Completed
//   Cancel    collection (if any) Cancelled                     -> request Cancelled
//
// These functions decide which actions the manager is offered, so the rules
// live here rather than in components.
// -----------------------------------------------------------------------------

/** The parts of a request and its collection that the workflow rules look at. */
export type WorkflowState = {
  status: RequestStatus
  collection: Pick<Collection, 'collection_status'> | null
}

/** Assign a collector. Allowed until the collection is scheduled; reassigning keeps the same collection. */
export function canAssignRequest({ status, collection }: WorkflowState): boolean {
  if (status === 'Reported') return collection === null
  return status === 'Assigned' && collection?.collection_status === 'Pending'
}

/** Schedule (or reschedule) a date. Needs an assigned collector. */
export function canScheduleCollection({ status, collection }: WorkflowState): boolean {
  if (status === 'Assigned') return collection?.collection_status === 'Pending'
  return status === 'Scheduled' && collection?.collection_status === 'Scheduled'
}

/** Start the collection. Only a scheduled collection can start. */
export function canStartCollection({ status, collection }: WorkflowState): boolean {
  return status === 'Scheduled' && collection?.collection_status === 'Scheduled'
}

/** Mark completed. Only a collection that is in progress can be completed. */
export function canCompleteCollection({ status, collection }: WorkflowState): boolean {
  return status === 'In Progress' && collection?.collection_status === 'In Progress'
}

/** Cancel. Any open request can be cancelled; a completed one cannot. */
export function canCancelCollection({ status, collection }: WorkflowState): boolean {
  return isOpenRequest(status) && collection?.collection_status !== 'Completed'
}

/** A Waste Manager may override the calculated priority while a request is open. */
export function canChangePriority(status: RequestStatus): boolean {
  return isOpenRequest(status)
}

/**
 * Checks a scheduled date ("YYYY-MM-DD"). Returns a message to show, or null if it's fine.
 * `today` is passed in (also "YYYY-MM-DD") so the rule is easy to test.
 */
export function validateScheduledDate(date: string, today: string): string | null {
  if (!date) return 'Choose a collection date.'
  if (date < today) return 'The collection date cannot be in the past.'
  return null
}

// -----------------------------------------------------------------------------
// Manager attention list
// -----------------------------------------------------------------------------

type AttentionCandidate = { status: RequestStatus; priority: Priority; created_at: string }

/** Open requests that are High priority or still waiting to be assigned. */
export function needsAttention(request: AttentionCandidate): boolean {
  return isOpenRequest(request.status) && (request.priority === 'High' || request.status === 'Reported')
}

const priorityRank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 }

/** Highest priority first, then oldest first. */
export function byAttentionOrder(a: AttentionCandidate, b: AttentionCandidate): number {
  return priorityRank[a.priority] - priorityRank[b.priority] || a.created_at.localeCompare(b.created_at)
}
