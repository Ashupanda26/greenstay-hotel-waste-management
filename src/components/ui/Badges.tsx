import type { CollectionStatus, Priority, RequestStatus } from '../../types/database'

// Badges always show the value as text; the colour and dot only reinforce it.

const badgeBase =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'

const priorityClass: Record<Priority, string> = {
  High: 'bg-danger-50 text-danger-700 ring-danger-200',
  Medium: 'bg-warning-50 text-warning-700 ring-warning-200',
  Low: 'bg-brand-50 text-brand-700 ring-brand-200',
}

const priorityDot: Record<Priority, string> = {
  High: 'bg-danger-500',
  Medium: 'bg-warning-500',
  Low: 'bg-brand-500',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`${badgeBase} ${priorityClass[priority]}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${priorityDot[priority]}`} />
      {priority}
      <span className="sr-only"> priority</span>
    </span>
  )
}

const statusClass: Record<RequestStatus | CollectionStatus, string> = {
  Reported: 'bg-surface text-ink ring-line-strong',
  Pending: 'bg-surface text-ink ring-line-strong',
  Assigned: 'bg-info-50 text-info-700 ring-info-200',
  Scheduled: 'bg-info-50 text-info-700 ring-info-200',
  'In Progress': 'bg-warning-50 text-warning-700 ring-warning-200',
  Completed: 'bg-brand-600 text-white ring-brand-600',
  Cancelled: 'bg-canvas text-muted ring-line',
}

/** Works for request statuses and collection statuses. */
export function StatusBadge({ status }: { status: RequestStatus | CollectionStatus }) {
  return <span className={`${badgeBase} ${statusClass[status]}`}>{status}</span>
}
