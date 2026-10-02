import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

type CardProps = {
  /** Heading for the card. Also labels the section for assistive technology. */
  title?: string
  description?: ReactNode
  icon?: IconName
  /** Buttons or links shown on the right of the heading. */
  actions?: ReactNode
  children: ReactNode
  className?: string
  /** Remove the inner padding, e.g. for edge-to-edge tables. */
  flush?: boolean
}

// The standard white panel used across the app.
export default function Card({ title, description, icon, actions, children, className = '', flush = false }: CardProps) {
  const headingId = title ? `card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined
  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-xl border border-line bg-surface shadow-card ${flush ? '' : 'p-5 sm:p-6'} ${className}`}
    >
      {title && (
        <div className={`flex flex-wrap items-start justify-between gap-3 ${flush ? 'px-5 pt-5 sm:px-6 sm:pt-6' : ''} mb-4`}>
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="mt-0.5 grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Icon name={icon} className="size-[18px]" />
              </span>
            )}
            <div className="min-w-0">
              <h2 id={headingId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
