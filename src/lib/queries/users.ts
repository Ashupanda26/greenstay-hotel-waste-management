import { supabase } from '../supabase.ts'
import { USER_ROLES, type User } from '../../types/database.ts'
import { queryFailed } from './queryFailed.ts'

export type StaffMember = Pick<User, 'id' | 'name' | 'role' | 'department'>

/** Roles that report waste. Waste managers handle requests rather than report them. */
const STAFF_ROLES = USER_ROLES.filter((role) => role !== 'waste_manager')

/** Staff who can report waste, for the demo staff selector. */
export async function listStaffMembers(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, department')
    .in('role', STAFF_ROLES)
    .order('name')
    .overrideTypes<StaffMember[], { merge: false }>()

  if (error) queryFailed('Loading staff', error)
  return data
}

/** Waste managers, who can be assigned collections. Chosen by database role. */
export async function listWasteManagers(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, department')
    .eq('role', 'waste_manager')
    .order('name')
    .overrideTypes<StaffMember[], { merge: false }>()

  if (error) queryFailed('Loading waste managers', error)
  return data
}
