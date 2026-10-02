// Demo staff selection.
// Authentication is intentionally simplified for portfolio demonstration
// purposes: there is no login. Visitors pick which fictional staff member they
// are acting as, and that person is recorded as the reporter of new requests.
// This is NOT authentication and must not be presented as such.

import { createContext, useContext } from 'react'
import type { StaffMember } from './queries/users.ts'
import type { AsyncState } from './useAsyncData.ts'

export type DemoStaffContextValue = {
  staff: AsyncState<StaffMember[]> & { retry: () => void }
  /** The staff member the visitor is acting as, once staff have loaded. */
  selected: StaffMember | null
  select: (userId: string) => void
}

export const DemoStaffContext = createContext<DemoStaffContextValue | null>(null)

export function useDemoStaff(): DemoStaffContextValue {
  const value = useContext(DemoStaffContext)
  if (!value) throw new Error('useDemoStaff must be used inside DemoStaffProvider')
  return value
}

const storageKey = 'greenstay.demoStaffId'

// Remembering the choice is a convenience only; storage may be unavailable.
export function readStoredStaffId(): string | null {
  try {
    return localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

export function storeStaffId(userId: string): void {
  try {
    localStorage.setItem(storageKey, userId)
  } catch {
    // Ignore: the selection still works for this visit.
  }
}
