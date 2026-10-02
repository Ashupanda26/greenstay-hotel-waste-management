import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import PageHeader from '../../components/ui/PageHeader'
import RequestList from '../../components/ui/RequestList'
import StateMessage from '../../components/ui/StateMessage'
import { buttonClass, textLinkClass } from '../../components/ui/styles'
import { useDemoStaff } from '../../lib/demoStaff'
import { listRequestsReportedBy } from '../../lib/queries/wasteRequests'
import { useAsyncData } from '../../lib/useAsyncData'
import { paths } from '../../routes/paths'

export default function MyRequestsPage() {
  const { selected } = useDemoStaff()

  return (
    <>
      <PageHeader
        eyebrow="Staff"
        title="My requests"
        description={selected ? `Waste requests reported by ${selected.name}, newest first.` : 'Requests you have reported.'}
        actions={
          <Link to={paths.staff.report} className={buttonClass('primary')}>
            <Icon name="report" className="size-4" />
            Report waste
          </Link>
        }
      />
      {selected && <Requests userId={selected.id} />}
    </>
  )
}

function Requests({ userId }: { userId: string }) {
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

  if (requests.data.length === 0) {
    return (
      <StateMessage kind="empty" title="You haven't reported any waste yet.">
        <Link to={paths.staff.report} className={textLinkClass}>
          Report waste
        </Link>{' '}
        to create your first request.
      </StateMessage>
    )
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted">
        {requests.data.length} request{requests.data.length === 1 ? '' : 's'}
      </p>
      <RequestList requests={requests.data} linkTo={paths.staff.requestDetails} caption="Your waste requests, newest first" />
    </>
  )
}
