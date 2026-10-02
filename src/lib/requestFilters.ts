import { formatRequestReference } from './format.ts'
import {
  PRIORITIES,
  REQUEST_STATUSES,
  WASTE_CLASSIFICATIONS,
  WASTE_TYPES,
  type Location,
  type WasteRequest,
} from '../types/database.ts'

// Search and filters for the manager's request queue. Filtering happens in the
// browser: the demo has a few dozen requests, so loading them all is simplest.

export type RequestFilters = {
  search: string
  status: string
  priority: string
  wasteType: string
  classification: string
}

/** The filter dropdowns: URL key, label and allowed values ('' means All). */
export const filterOptions = [
  { key: 'status', label: 'Status', values: REQUEST_STATUSES },
  { key: 'priority', label: 'Priority', values: PRIORITIES },
  { key: 'wasteType', label: 'Waste type', values: WASTE_TYPES },
  { key: 'classification', label: 'Classification', values: WASTE_CLASSIFICATIONS },
] as const

/** Reads filters from the URL, ignoring any value that isn't allowed. */
export function readFilters(params: URLSearchParams): RequestFilters {
  const pick = (key: string, allowed: readonly string[]) => {
    const value = params.get(key) ?? ''
    return allowed.includes(value) ? value : ''
  }
  return {
    search: params.get('q') ?? '',
    status: pick('status', REQUEST_STATUSES),
    priority: pick('priority', PRIORITIES),
    wasteType: pick('wasteType', WASTE_TYPES),
    classification: pick('classification', WASTE_CLASSIFICATIONS),
  }
}

export function hasActiveFilters(filters: RequestFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== '')
}

type FilterableRequest = WasteRequest & { location: Pick<Location, 'name'> | null }

/**
 * Search matches the request reference (with or without "GS-") or the location name.
 * All filters must match.
 */
export function filterRequests<T extends FilterableRequest>(requests: T[], filters: RequestFilters): T[] {
  const search = filters.search.trim().toLowerCase()
  const referenceSearch = search.replace(/^gs-?/, '')

  return requests.filter((request) => {
    if (search) {
      const reference = formatRequestReference(request.id).toLowerCase()
      const location = request.location?.name.toLowerCase() ?? ''
      if (!reference.includes(referenceSearch) && !location.includes(search)) return false
    }
    if (filters.status && request.status !== filters.status) return false
    if (filters.priority && request.priority !== filters.priority) return false
    if (filters.wasteType && request.waste_type !== filters.wasteType) return false
    if (filters.classification && request.waste_classification !== filters.classification) return false
    return true
  })
}
