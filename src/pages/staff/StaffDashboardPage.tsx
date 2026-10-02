import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import KpiCard from '../../components/ui/KpiCard'
import PageHeader from '../../components/ui/PageHeader'
import RequestList from '../../components/ui/RequestList'
import StateMessage from '../../components/ui/StateMessage'
import { buttonClass, textLinkClass } from '../../components/ui/styles'
import { isOpenRequest } from '../../lib/businessRules'
import { useDemoStaff } from '../../lib/demoStaff'
import { listRequestsReportedBy } from '../../lib/queries/wasteRequests'
import { useAsyncData } from '../../lib/useAsyncData'
import { paths } from '../../routes/paths'

const RECENT_COUNT = 5

export default function StaffDashboardPage() {
  const { selected } = useDemoStaff()
  const firstName = selected?.name.split(' ')[0]

  return (
    <>
      <PageHeader
        eyebrow="Staff"
        title={firstName ? `Welcome back, ${firstName}` : 'Staff dashboard'}
        description="Here's an overview of your waste requests."
        actions={
          <Link to={paths.staff.report} className={buttonClass('primary', 'lg')}>
            <Icon name="report" className="size-5" />
            Report waste
          </Link>
        }
      />
      {selected && <Overview userId={selected.id} />}
    </>
  )
}

function Overview({ userId }: { userId: string }) {
  const load = useCallback(() => listRequestsReportedBy(userId), [userId])
  const requests = useAsyncData(load)

  if (requests.status === 'loading') return <StateMessage kind="loading" title="Loading your requests…" />

  if (requests.status === 'error') {
    return (
      <StateMessage kind="error" title="We couldn't load your requests.">
        Check your connection and{' '}
        <button type="button" onClick={requests.retry} className={textLinkClass}>
          try again
        </button>
        .
      </StateMessage>
    )
  }

  const all = requests.data
  const open = all.filter((r) => isOpenRequest(r.status))

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Total requests" value={all.length} context="Everything you've reported" icon="list" tone="brand" />
        <KpiCard label="Open requests" value={open.length} context="Not yet completed or cancelled" icon="clock" />
        <KpiCard
          label="Completed"
          value={all.filter((r) => r.status === 'Completed').length}
          context="Collected"
          icon="check"
        />
        <KpiCard
          label="High priority"
          value={open.filter((r) => r.priority === 'High').length}
          context="Open requests marked High"
          icon="flag"
          tone="danger"
        />
      </dl>

      <Card
        title="Recent requests"
        description="Your latest reports, newest first."
        icon="list"
        flush
        actions={
          all.length > 0 && (
            <Link to={paths.staff.requests} className={buttonClass('ghost', 'sm')}>
              View all
              <Icon name="arrowRight" className="size-4" />
            </Link>
          )
        }
      >
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          {all.length === 0 ? (
            <StateMessage kind="empty" title="You haven't reported any waste yet.">
              <Link to={paths.staff.report} className={textLinkClass}>
                Report waste
              </Link>{' '}
              to create your first request.
            </StateMessage>
          ) : (
            <RequestList
              requests={all.slice(0, RECENT_COUNT)}
              linkTo={paths.staff.requestDetails}
              caption="Your most recent waste requests"
              showBinLevel={false}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
