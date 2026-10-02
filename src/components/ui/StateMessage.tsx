import type { ReactNode } from 'react'
import Icon from './Icon'

type StateMessageProps = {
  kind: 'loading' | 'error' | 'empty'
  title: string
  children?: ReactNode
}

const kindStyle = {
  loading: { box: 'border-line bg-surface', icon: 'bg-canvas text-muted' },
  empty: { box: 'border-dashed border-line-strong bg-surface', icon: 'bg-canvas text-muted' },
  error: { box: 'border-danger-200 bg-danger-50', icon: 'bg-surface text-danger-700' },
}

// Loading, error and empty states, styled consistently across pages.
export default function StateMessage({ kind, title, children }: StateMessageProps) {
  const style = kindStyle[kind]
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border p-5 ${style.box}`}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${style.icon}`}>
        {kind === 'loading' ? (
          <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-brand-600" />
        ) : (
          <Icon name={kind === 'error' ? 'alert' : 'inbox'} className="size-[18px]" />
        )}
      </span>
      <div className="min-w-0 pt-1">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm text-muted">{children}</div>}
      </div>
    </div>
  )
}
