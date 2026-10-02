import { useCallback, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ManageRequestPanel from '../../components/manager/ManageRequestPanel'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badges'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import StateMessage from '../../components/ui/StateMessage'
import StatusSteps from '../../components/ui/StatusSteps'
import { buttonClass, textLinkClass } from '../../components/ui/styles'
import { binFillLevelFor } from '../../lib/businessRules'
import { formatDate, formatDateTime, formatRequestReference } from '../../lib/format'
import { getRequestDetails, type WasteRequestDetails } from '../../lib/queries/wasteRequests'
import { useAsyncData } from '../../lib/useAsyncData'
import { paths } from '../../routes/paths'

// Shared by staff (/staff/requests/:requestId) and manager (/manager/requests/:requestId).
// Managers also get the actions panel.
export default function RequestDetailsPage() {
  const { requestId = '' } = useParams()
  const { pathname } = useLocation()
  const isManager = pathname.startsWith(paths.manager.requests)
  const backTo = isManager
    ? { to: paths.manager.requests, label: 'Back to requests' }
    : { to: paths.staff.requests, label: 'Back to my requests' }

  const load = useCallback(() => getRequestDetails(requestId), [requestId])
  const request = useAsyncData(load)

  const backLink = (
    <Link to={backTo.to} className={`-ml-3 mb-4 ${buttonClass('ghost', 'sm')}`}>
      <Icon name="arrowLeft" className="size-4" />
      {backTo.label}
    </Link>
  )

  if (request.status === 'loading') {
    return (
      <>
        {backLink}
        <StateMessage kind="loading" title="Loading request…" />
      </>
    )
  }

  if (request.status === 'error') {
    return (
      <>
        {backLink}
        <StateMessage kind="error" title="We couldn't load this request.">
          Check your connection and{' '}
          <button type="button" onClick={request.retry} className={textLinkClass}>
            try again
          </button>
          .
        </StateMessage>
      </>
    )
  }

  if (!request.data) {
    return (
      <>
        {backLink}
        <div className="rounded-xl border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-muted">
            <Icon name="search" className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Request not found</h1>
          <p className="mt-1 text-muted">This request doesn't exist or may have been removed.</p>
        </div>
      </>
    )
  }

  const r = request.data
  return (
    <div className={isManager ? '' : 'max-w-4xl'}>
      {backLink}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wider text-brand-700 uppercase">
            {isManager ? 'Waste Manager' : 'Staff'} · Request
          </p>
          <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">{formatRequestReference(r.id)}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon name="location" className="size-4" />
              {r.location?.name ?? 'Unknown location'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Reported {formatDateTime(r.created_at)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={r.status} />
          <PriorityBadge priority={r.priority} />
        </div>
      </div>

      <div className={isManager ? 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]' : ''}>
        <div className="space-y-6">
          <section aria-label="Progress" className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <StatusSteps status={r.status} />
          </section>

          <Card title="Request details" icon="report">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Detail label="Location">{r.location?.name ?? 'Unknown'}</Detail>
              <Detail label="Area">{r.location?.area ?? 'Not recorded'}</Detail>
              <Detail label="Reported by">
                {r.reporter?.name ?? 'Unknown'}
                {r.reporter?.department && <span className="text-muted"> · {r.reporter.department}</span>}
              </Detail>
              <Detail label="Reported">{formatDateTime(r.created_at)}</Detail>
              <Detail label="Waste type">{r.waste_type}</Detail>
              <Detail label="Classification">{r.waste_classification}</Detail>
              <Detail label="Bin fill level">
                {binFillLevelFor(r.bin_level).value}
                <span className="text-muted"> · {binFillLevelFor(r.bin_level).range}</span>
              </Detail>
              <Detail label="Priority">
                <PriorityBadge priority={r.priority} />
              </Detail>
              <Detail label="Status">
                <StatusBadge status={r.status} />
              </Detail>
              {r.completed_at && <Detail label="Completed">{formatDateTime(r.completed_at)}</Detail>}
              <div className="sm:col-span-2">
                <Detail label="Description">
                  {r.description ? (
                    <span className="whitespace-pre-line">{r.description}</span>
                  ) : (
                    <span className="text-muted">No description given.</span>
                  )}
                </Detail>
              </div>
            </dl>
          </Card>

          <CollectionSummary collection={r.collection} />
        </div>

        {isManager && (
          <div className="lg:sticky lg:top-36">
            <ManageRequestPanel key={r.id} request={r} onChanged={request.retry} />
          </div>
        )}
      </div>
    </div>
  )
}

function CollectionSummary({ collection }: { collection: WasteRequestDetails['collection'] }) {
  return (
    <Card title="Collection" icon="truck">
      {collection ? (
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Detail label="Assigned collector">{collection.assignee?.name ?? 'Unknown'}</Detail>
          <Detail label="Collection status">
            <StatusBadge status={collection.collection_status} />
          </Detail>
          <Detail label="Scheduled date">
            {collection.scheduled_date ? formatDate(collection.scheduled_date) : <span className="text-muted">Not scheduled yet</span>}
          </Detail>
          {collection.completed_at && <Detail label="Collected">{formatDateTime(collection.completed_at)}</Detail>}
        </dl>
      ) : (
        <p className="flex items-center gap-2 text-muted">
          <Icon name="clock" className="size-4" />
          Collection not yet assigned
        </p>
      )}
    </Card>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
