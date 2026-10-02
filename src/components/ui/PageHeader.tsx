import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: ReactNode
  /** Small label above the title, e.g. the workspace name. */
  eyebrow?: string
  /** Primary page actions, shown on the right on wider screens. */
  actions?: ReactNode
}

export default function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-wider text-brand-700 uppercase">{eyebrow}</p>}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-base text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
