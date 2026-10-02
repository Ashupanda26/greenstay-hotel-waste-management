import { useState, type ReactNode } from 'react'
import { DemoStaffContext, readStoredStaffId, storeStaffId } from '../../lib/demoStaff'
import { listStaffMembers } from '../../lib/queries/users'
import { useAsyncData } from '../../lib/useAsyncData'

// Makes the demo staff selection available to every page. See lib/demoStaff.ts.
export default function DemoStaffProvider({ children }: { children: ReactNode }) {
  const staff = useAsyncData(listStaffMembers)
  const [selectedId, setSelectedId] = useState(readStoredStaffId)

  const members = staff.status === 'success' ? staff.data : []
  // Fall back to the first staff member if nothing (or someone unknown) was stored.
  const selected = members.find((member) => member.id === selectedId) ?? members[0] ?? null

  const select = (userId: string) => {
    setSelectedId(userId)
    storeStaffId(userId)
  }

  return <DemoStaffContext value={{ staff, selected, select }}>{children}</DemoStaffContext>
}
