import { Link } from 'react-router-dom'
import Icon, { type IconName } from './Icon'

type KpiCardProps = {
  label: string
  value: number | string
  /** Short supporting line under the value. */
  context?: string
  icon?: IconName
  tone?: 'neutral' | 'brand' | 'danger'
  /** Makes the card a link, e.g. to a filtered list. */
  to?: string
}

const toneClass = {
  neutral: { card: 'border-line', icon: 'bg-canvas text-muted' },
  brand: { card: 'border-line', icon: 'bg-brand-50 text-brand-700' },
  danger: { card: 'border-danger-200 bg-danger-50/40', icon: 'bg-danger-50 text-danger-700' },
}

// One key figure. Rendered inside a <dl>, so the label is a <dt> and the value a <dd>.
export default function KpiCard({ label, value, context, icon, tone = 'neutral', to }: KpiCardProps) {
  const tones = toneClass[tone]
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <dt className="text-sm font-medium text-muted">{label}</dt>
        {icon && (
          <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tones.icon}`}>
            <Icon name={icon} className="size-[18px]" />
          </span>
        )}
      </div>
      <dd className="mt-2 font-display text-3xl font-bold tracking-tight tabular-nums">{value}</dd>
      {context && <dd className="mt-1 text-xs text-muted">{context}</dd>}
    </>
  )
  const cardClass = `relative rounded-xl border bg-surface p-4 shadow-card sm:p-5 ${tones.card}`

  if (to) {
    return (
      <div className={`${cardClass} transition-shadow hover:shadow-raised has-focus-visible:shadow-raised`}>
        {body}
        <dd>
          <Link to={to} className="absolute inset-0 rounded-xl">
            <span className="sr-only">View {label.toLowerCase()}</span>
          </Link>
        </dd>
      </div>
    )
  }
  return <div className={cardClass}>{body}</div>
}
