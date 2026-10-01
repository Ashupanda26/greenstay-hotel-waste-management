import PageHeader from '../../components/ui/PageHeader'
import PlaceholderPanel from '../../components/ui/PlaceholderPanel'

export default function MyRequestsPage() {
  return (
    <>
      <PageHeader title="My requests" description="Requests you have reported." />
      <PlaceholderPanel
        planned={['List of your requests with current status', 'Opening a request to see its details']}
      />
    </>
  )
}
