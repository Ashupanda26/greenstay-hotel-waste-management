// Row types for the GreenStay database.
// The value lists below mirror the CHECK constraints in
// supabase/migrations/001_initial_schema.sql. Change both together.

export const USER_ROLES = ['housekeeping', 'kitchen', 'front_desk', 'waste_manager'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const WASTE_TYPES = [
  'Food Waste',
  'General Waste',
  'Paper/Cardboard',
  'Plastic',
  'Glass',
  'Other',
] as const
export type WasteType = (typeof WASTE_TYPES)[number]

export const WASTE_CLASSIFICATIONS = ['Recyclable', 'Non-Recyclable'] as const
export type WasteClassification = (typeof WASTE_CLASSIFICATIONS)[number]

export const PRIORITIES = ['Low', 'Medium', 'High'] as const
export type Priority = (typeof PRIORITIES)[number]

export const REQUEST_STATUSES = [
  'Reported',
  'Assigned',
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled',
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const COLLECTION_STATUSES = [
  'Pending',
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled',
] as const
export type CollectionStatus = (typeof COLLECTION_STATUSES)[number]

// Column names match the database (snake_case) so rows from Supabase can be
// used as-is. UUIDs are strings; timestamps and dates are ISO 8601 strings.

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string | null
  created_at: string
}

export interface Location {
  id: string
  name: string
  area: string | null
  /** Total bin capacity in litres. */
  capacity: number | null
  created_at: string
}

export interface WasteRequest {
  id: string
  location_id: string
  reported_by: string
  waste_type: WasteType
  waste_classification: WasteClassification
  /** Bin fullness as a percentage, 0-100. */
  bin_level: number
  /** Defaults to calculatePriority(bin_level); a Waste Manager may override it. */
  priority: Priority
  description: string | null
  status: RequestStatus
  created_at: string
  completed_at: string | null
}

export interface Collection {
  id: string
  request_id: string
  assigned_to: string
  /** Date only, e.g. "2026-10-02". */
  scheduled_date: string | null
  collection_status: CollectionStatus
  completed_at: string | null
  created_at: string
}
