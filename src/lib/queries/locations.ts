import { supabase } from '../supabase.ts'
import type { Location } from '../../types/database.ts'
import { queryFailed } from './queryFailed.ts'

export type LocationOption = Pick<Location, 'id' | 'name' | 'area' | 'capacity'>

/** All hotel locations, alphabetically. */
export async function listLocations(): Promise<LocationOption[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, area, capacity')
    .order('name')
    .overrideTypes<LocationOption[], { merge: false }>()

  if (error) queryFailed('Loading locations', error)
  return data
}
