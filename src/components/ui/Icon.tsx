import type { ReactNode } from 'react'

// A small inline icon set (24px grid, 1.75px stroke), so the app needs no icon dependency.
// Icons are decorative: they sit next to a text label, which carries the meaning.

const paths = {
  leaf: (
    <>
      <path d="M5 19c0-8 5.5-13.5 15-14-.5 10-6 15-12.5 15-1 0-1.8-.3-2.5-1Z" />
      <path d="M5.5 19.5 13 12" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="8" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
      <rect x="3.5" y="14.5" width="7" height="6" rx="1.5" />
    </>
  ),
  report: (
    <>
      <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z" />
      <path d="M14 3.5v5h5" />
      <path d="M12 11.5v6M9 14.5h6" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 20h16" />
      <path d="M7 16v-5M12 16V6M17 16v-8" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7l1 13h9l1-13" />
      <path d="M10 11v5.5M14 11v5.5" />
    </>
  ),
  recycle: (
    <>
      <path d="M7.5 13.5 5 18h6" />
      <path d="M9.5 6.5 12 3l3 5" />
      <path d="M17.5 12l2 4.5-3.5 2" />
      <path d="M5 18l2.6-4.5M12 3l-3 5.2M19.5 16.5H13" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17l4-5" />
      <circle cx="12" cy="17" r="1.2" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V4" />
      <path d="M5.5 4.5h11l-2 4 2 4h-11" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11v9.5H3Z" />
      <path d="M14 10h4l3 3.5V16h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c1-3.8 4-5.8 7.5-5.8s6.5 2 7.5 5.8" />
    </>
  ),
  manager: (
    <>
      <rect x="4" y="5" width="16" height="15.5" rx="2" />
      <path d="M9 3.5h6v3H9Z" />
      <path d="m8.5 13 2.3 2.3 4.7-4.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  arrowLeft: <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />,
  arrowDown: <path d="M12 4.5v15M6 13.5l6 6 6-6" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  play: <path d="M7.5 5v14l11-7Z" />,
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4Z" />
      <path d="M12 10v4.5M12 17.3v.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.8v.2" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  filter: <path d="M4 5h16l-6.2 7.5V19l-3.6-1.8v-4.7Z" />,
  inbox: (
    <>
      <path d="M3.5 13.5 6 5h12l2.5 8.5V19H3.5Z" />
      <path d="M3.5 13.5h5l1 2h5l1-2h5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1" />
      <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1" />
      <path d="M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

export default function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  )
}
