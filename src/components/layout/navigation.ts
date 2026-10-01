import { paths } from '../../routes/paths'

export type NavItem = { label: string; to: string }
export type NavGroup = { heading: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  {
    heading: 'Staff',
    items: [
      { label: 'Dashboard', to: paths.staff.dashboard },
      { label: 'Report waste', to: paths.staff.report },
      { label: 'My requests', to: paths.staff.requests },
    ],
  },
  {
    heading: 'Waste manager',
    items: [
      { label: 'Dashboard', to: paths.manager.dashboard },
      { label: 'Requests', to: paths.manager.requests },
      { label: 'Analytics', to: paths.manager.analytics },
    ],
  },
]
