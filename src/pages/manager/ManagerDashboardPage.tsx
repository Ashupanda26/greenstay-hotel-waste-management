import { Link } from 'react-router-dom'
import { StatusBadge } from '../../components/ui/Badges'
import Card from '../../components/ui/Card'
import Icon, { type IconName } from '../../components/ui/Icon'
import KpiCard from '../../components/ui/KpiCard'
import PageHeader from '../../components/ui/PageHeader'
import RequestList, { type RequestListItem } from '../../components/ui/RequestList'
import StateMessage from '../../components/ui/StateMessage'
import { buttonClass, textLinkClass } from '../../components/ui/styles'
import { byAttentionOrder, isOpenRequest, needsAttention } from '../../lib/businessRules'
import { formatDate, formatDateTime, formatRequestReference } from '../../lib/format'
import { listRecentCollections, type RecentCollection } from '../../lib/queries/collections'
import { listManagerRequests } from '../../lib/queries/wasteRequests'
import { useAsyncData } from '../../lib/useAsyncData'
import { paths } from '../../routes/paths'
import type { RequestStatus } from '../../types/database'

const ATTENTION_LIMIT = 6
const ACTIVITY_LIMIT = 6

const pipeline: { status: RequestStatus; icon: IconName }[] = [
  { status: 'Reported', icon: 'inbox' },
  { status: 'Assigned', icon: 'user' },
  { status: 'Scheduled', icon: 'calendar' },
  { status: 'In Progress', icon: 'truck' },
]

const queueFor = (status: RequestStatus) => `${paths.manager.requests}?status=${encodeURIComponent(status)}`

// Recent collections are loaded once for the page, independently of requests.
const loadRecentCollections = () => listRecentCollections(ACTIVITY_LIMIT)

export default function ManagerDashboardPage() {
  const requests = useAsyncData(listManagerRequests)

  return (
    <>
      <PageHeader
        eyebrow="Waste Manager"
        title="Operations dashboard"
        description="Waste requests and collections across the hotel."
        actions={
          <Link to={paths.manager.requests} className={buttonClass('primary')}>
            <Icon name="list" className="size-4" />
            Open request queue
          </Link>
        }
      />

      {requests.status === 'loading' && <StateMessage kind="loading" title="Loading dashboard…" />}

      {requests.status === 'error' && (
        <StateMessage kind="error" title="We couldn't load the dashboard.">
          Check your connection and{' '}
          <button type="button" onClick={requests.retry} className={textLinkClass}>
            try again
          </button>
          .
        </StateMessage>
      )}

      {requests.status === 'success' && (
        <div className="space-y-6">
          <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            <KpiCard label="Total requests" value={requests.data.length} context="All time" icon="list" tone="brand" to={paths.manager.requests} />
            <KpiCard
              label="Completed"
              value={requests.data.filter((r) => r.status === 'Completed').length}
              context="Collected and closed"
              icon="check"
              tone="brand"
              to={queueFor('Completed')}
            />
            <KpiCard
              label="Open high priority"
              value={requests.data.filter((r) => r.priority === 'High' && isOpenRequest(r.status)).length}
              context="Not yet completed or cancelled"
              icon="flag"
              tone="danger"
              to={`${paths.manager.requests}?priority=High`}
            />
          </dl>

          <Card title="Request pipeline" description="Open requests at each stage of the workflow." icon="truck">
            <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {pipeline.map((stage, index) => (
                <li key={stage.status} className="relative">
                  <Link
                    to={queueFor(stage.status)}
                    className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-4 transition-colors hover:border-brand-500 hover:bg-brand-50"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface text-brand-700 ring-1 ring-line">
                      <Icon name={stage.icon} className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-muted">{stage.status}</span>
                      <span className="block font-display text-2xl font-bold tabular-nums">
                        {requests.data.filter((r) => r.status === stage.status).length}
                      </span>
                    </span>
                  </Link>
                  {index < pipeline.length - 1 && (
                    <Icon
                      name="arrowRight"
                      className="absolute top-1/2 -right-3 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-surface p-0.5 text-brand-600 ring-1 ring-line lg:block"
                    />
                  )}
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card
              title="Requests requiring attention"
              description="Open requests that are High priority or not yet assigned. Highest priority first, then oldest."
              icon="alert"
              flush
            >
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <AttentionList requests={requests.data} />
              </div>
            </Card>
            <CollectionActivity />
          </div>
        </div>
      )}
    </>
  )
}

function AttentionList({ requests }: { requests: RequestListItem[] }) {
  const attention = requests.filter(needsAttention).sort(byAttentionOrder)
  if (attention.length === 0) {
    return <StateMessage kind="empty" title="Nothing needs attention right now." />
  }
  return (
    <>
      <RequestList
        requests={attention.slice(0, ATTENTION_LIMIT)}
        linkTo={paths.manager.requestDetails}
        caption="Requests requiring attention"
        showReporter
        showClassification={false}
        showBinLevel={false}
        tableFrom="lg"
      />
      {attention.length > ATTENTION_LIMIT && (
        <p className="mt-3 text-sm text-muted">
          Showing {ATTENTION_LIMIT} of {attention.length}.{' '}
          <Link to={paths.manager.requests} className={textLinkClass}>
            See all requests
          </Link>
        </p>
      )}
    </>
  )
}

function CollectionActivity() {
  const collections = useAsyncData(loadRecentCollections)

  return (
    <Card title="Collection activity" description="Most recently assigned collections." icon="truck">
      {collections.status === 'loading' && <StateMessage kind="loading" title="Loading collections…" />}
      {collections.status === 'error' && (
        <StateMessage kind="error" title="We couldn't load collections.">
          <button type="button" onClick={collections.retry} className={textLinkClass}>
            Try again
          </button>
        </StateMessage>
      )}
      {collections.status === 'success' &&
        (collections.data.length === 0 ? (
          <StateMessage kind="empty" title="No collections have been assigned yet." />
        ) : (
          <ul className="-my-3 divide-y divide-line">
            {collections.data.map((c) => (
              <ActivityItem key={c.id} collection={c} />
            ))}
          </ul>
        ))}
    </Card>
  )
}

function activityDetail(c: RecentCollection): string {
  if (c.completed_at) return `Completed ${formatDateTime(c.completed_at)}`
  if (c.scheduled_date) return `Scheduled for ${formatDate(c.scheduled_date)}`
  return `Assigned ${formatDateTime(c.created_at)}`
}

function ActivityItem({ collection: c }: { collection: RecentCollection }) {
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {c.request ? (
            <Link to={paths.manager.requestDetails(c.request.id)} className="font-semibold hover:text-brand-700 hover:underline">
              {c.request.location?.name ?? 'Unknown location'}
              <span className="ml-1.5 font-mono text-xs font-semibold text-brand-700">{formatRequestReference(c.request.id)}</span>
            </Link>
          ) : (
            <span className="font-semibold">Unknown request</span>
          )}
          <p className="text-sm text-muted">{c.assignee?.name ?? 'Unassigned'}</p>
          <p className="text-xs text-muted">{activityDetail(c)}</p>
        </div>
        <StatusBadge status={c.collection_status} />
      </div>
    </li>
  )
}
