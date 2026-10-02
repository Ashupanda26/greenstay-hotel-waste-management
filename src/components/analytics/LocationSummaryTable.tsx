import type { LocationSummary } from '../../lib/analytics'
import Icon from '../ui/Icon'

const columns: { key: keyof Omit<LocationSummary, 'locationId' | 'name'>; label: string }[] = [
  { key: 'total', label: 'Total requests' },
  { key: 'open', label: 'Open requests' },
  { key: 'highPriority', label: 'High priority' },
  { key: 'recyclable', label: 'Recyclable' },
  { key: 'nonRecyclable', label: 'Non-Recyclable' },
  { key: 'completed', label: 'Completed' },
]

// Table on wider screens, one card per location on small screens
// (the same approach as the request lists).
export default function LocationSummaryTable({ rows }: { rows: LocationSummary[] }) {
  return (
    <section aria-labelledby="location-summary-heading" className="rounded-xl border border-line bg-surface shadow-card">
      <div className="flex items-start gap-3 p-5 sm:p-6">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <Icon name="location" className="size-[18px]" />
        </span>
        <div>
          <h2 id="location-summary-heading" className="text-base font-semibold sm:text-lg">
            Location Operational Summary
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Filtered requests per location, busiest first. Locations with no matching requests are not shown.
          </p>
        </div>
      </div>

      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-y border-line bg-canvas/70 text-xs font-semibold tracking-wide text-muted uppercase">
          <tr>
            <th scope="col" className="py-3 pr-3 pl-6">Location</th>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-3 text-right last:pr-6">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.locationId} className="hover:bg-canvas/60">
              <th scope="row" className="py-3 pr-3 pl-6 font-semibold">
                {row.name}
              </th>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 py-3 text-right tabular-nums last:pr-6 ${c.key === 'highPriority' && row[c.key] > 0 ? 'font-semibold text-danger-700' : ''}`}
                >
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="space-y-3 px-5 pb-5 md:hidden">
        {rows.map((row) => (
          <li key={row.locationId} className="rounded-lg border border-line p-3">
            <p className="font-semibold">{row.name}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {columns.map((c) => (
                <div key={c.key} className="flex justify-between gap-2">
                  <dt className="text-muted">{c.label}</dt>
                  <dd className="font-semibold tabular-nums">{row[c.key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}
