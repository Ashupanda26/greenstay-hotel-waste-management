import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Logs the technical details (development only) and throws a plain error.
 * Pages catch it and show their own friendly message, so raw database errors
 * never reach the user.
 */
export function queryFailed(action: string, error: PostgrestError): never {
  if (import.meta.env.DEV) {
    console.error(`[GreenStay] ${action} failed:`, error)
  }
  throw new Error(`${action} failed`)
}
