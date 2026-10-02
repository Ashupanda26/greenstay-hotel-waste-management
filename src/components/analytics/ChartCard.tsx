import type { ReactNode } from 'react'
import Icon, { type IconName } from '../ui/Icon'

type ChartCardProps = {
  title: string
  description?: string
  icon?: IconName
  /** The chart's numbers as text, for screen readers (charts are hidden from them). */
  data: { label: string; value: string }[]
  children: ReactNode
  className?: string
}

export default function ChartCard({ title, description, icon, data, children, className = '' }: ChartCardProps) {
  const id = `chart-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <section aria-labelledby={id} className={`rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon name={icon} className="size-[18px]" />
          </span>
        )}
        <div>
          <h2 id={id} className="text-base font-semibold sm:text-lg">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
      </div>
      <div aria-hidden="true" className="mt-5">
        {children}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
