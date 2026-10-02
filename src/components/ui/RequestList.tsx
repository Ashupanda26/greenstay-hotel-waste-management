import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { binFillLevelFor } from '../../lib/businessRules'
import { formatDateTime, formatRequestReference } from '../../lib/format'
import type { Location, User, WasteRequest } from '../../types/database'
import { PriorityBadge, StatusBadge } from './Badges'
import Icon from './Icon'

export type RequestListItem = WasteRequest & {
  location: Pick<Location, 'name'> | null
  reporter?: Pick<User, 'name'> | null
}

type RequestListProps = {
  requests: RequestListItem[]
  /** Where each request opens. */
  linkTo: (id: string) => string
  caption: string
  showReporter?: boolean
  showClassification?: boolean
  showBinLevel?: boolean
  /** Screen size from which the table replaces cards. Use 'lg' when the list sits in a narrower column. */
  tableFrom?: 'md' | 'lg'
}

const layoutClass = {
  md: { table: 'hidden md:block', cards: 'md:hidden' },
  lg: { table: 'hidden lg:block', cards: 'lg:hidden' },
}

// Requests as a table on wider screens and as cards on small screens, so
// neither needs horizontal scrolling. Whole rows and cards are clickable; the
// reference link is the keyboard and screen reader target.
export default function RequestList({
  requests,
  linkTo,
  caption,
  showReporter = false,
  showClassification = true,
  showBinLevel = true,
  tableFrom = 'md',
}: RequestListProps) {
  const navigate = useNavigate()
  const openRow = (event: MouseEvent, id: string) => {
    // Let real links and text selection behave normally.
    if ((event.target as HTMLElement).closest('a') || window.getSelection()?.toString()) return
    navigate(linkTo(id))
  }

  return (
    <>
      <div className={`overflow-hidden rounded-xl border border-line bg-surface shadow-card ${layoutClass[tableFrom].table}`}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-canvas/70 text-xs font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Reference</th>
              <th scope="col" className="px-4 py-3">Location</th>
              <th scope="col" className="px-4 py-3">Waste</th>
              {showBinLevel && <th scope="col" className="px-4 py-3">Fill level</th>}
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Reported</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {requests.map((r) => (
              <tr
                key={r.id}
                onClick={(event) => openRow(event, r.id)}
                className="cursor-pointer transition-colors hover:bg-brand-50/50"
              >
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <Link to={linkTo(r.id)} className="font-mono text-[13px] font-semibold text-brand-700 hover:underline">
                    {formatRequestReference(r.id)}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-medium">{r.location?.name ?? 'Unknown'}</span>
                  {showReporter && <span className="block text-xs text-muted">by {r.reporter?.name ?? 'Unknown'}</span>}
                </td>
                <td className="px-4 py-3.5">
                  {r.waste_type}
                  {showClassification && <span className="block text-xs text-muted">{r.waste_classification}</span>}
                </td>
                {showBinLevel && (
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {binFillLevelFor(r.bin_level).value}
                    <span className="block text-xs text-muted">{binFillLevelFor(r.bin_level).range}</span>
                  </td>
                )}
                <td className="px-4 py-3.5">
                  <PriorityBadge priority={r.priority} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted">{formatDateTime(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={caption} className={`space-y-3 ${layoutClass[tableFrom].cards}`}>
        {requests.map((r) => (
          <li key={r.id}>
            <Link
              to={linkTo(r.id)}
              className="block rounded-xl border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-raised"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[13px] font-semibold text-brand-700">{formatRequestReference(r.id)}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 font-semibold">
                <Icon name="location" className="size-4 text-muted" />
                {r.location?.name ?? 'Unknown'}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {r.waste_type}
                {showClassification && ` · ${r.waste_classification}`}
                {showBinLevel && ` · Fill level ${binFillLevelFor(r.bin_level).value} · ${binFillLevelFor(r.bin_level).range}`}
                {showReporter && r.reporter && ` · by ${r.reporter.name}`}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <PriorityBadge priority={r.priority} />
                <span className="text-xs text-muted">{formatDateTime(r.created_at)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
