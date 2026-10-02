import { paths } from '../../routes/paths'
import type { IconName } from '../ui/Icon'

export type WorkspaceId = 'staff' | 'manager'

export type NavItem = {
  label: string
  to: string
  icon: IconName
  /** Only active on this exact path (dashboards), not on pages below it. */
  end?: boolean
}

export type Workspace = {
  id: WorkspaceId
  label: string
  shortLabel: string
  icon: IconName
  home: string
  items: NavItem[]
}

// The two demo workspaces. The header shows a switch between them and, below
// it, the sections of whichever workspace the current page belongs to.
export const workspaces: Record<WorkspaceId, Workspace> = {
  staff: {
    id: 'staff',
    label: 'Staff',
    shortLabel: 'Staff',
    icon: 'user',
    home: paths.staff.dashboard,
    items: [
      { label: 'Dashboard', to: paths.staff.dashboard, icon: 'dashboard', end: true },
      { label: 'Report waste', to: paths.staff.report, icon: 'report' },
      { label: 'My requests', to: paths.staff.requests, icon: 'list' },
    ],
  },
  manager: {
    id: 'manager',
    label: 'Waste Manager',
    shortLabel: 'Manager',
    icon: 'manager',
    home: paths.manager.dashboard,
    items: [
      { label: 'Dashboard', to: paths.manager.dashboard, icon: 'dashboard', end: true },
      { label: 'Requests', to: paths.manager.requests, icon: 'list' },
      { label: 'Analytics', to: paths.manager.analytics, icon: 'analytics' },
    ],
  },
}

/** Which workspace a URL belongs to; null for the landing page and unknown pages. */
export function workspaceForPath(pathname: string): WorkspaceId | null {
  if (pathname === paths.staff.dashboard || pathname.startsWith(`${paths.staff.dashboard}/`)) return 'staff'
  if (pathname === paths.manager.dashboard || pathname.startsWith(`${paths.manager.dashboard}/`)) return 'manager'
  return null
}
