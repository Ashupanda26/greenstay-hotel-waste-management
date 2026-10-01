import { useParams } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import PlaceholderPanel from '../../components/ui/PlaceholderPanel'

// Shared by staff (/staff/requests/:requestId) and manager (/manager/requests/:requestId).
export default function RequestDetailsPage() {
  const { requestId } = useParams()

  return (
    <>
      <PageHeader title="Request details" description={`Request reference: ${requestId ?? 'unknown'}`} />
      <PlaceholderPanel
        planned={[
          'Full request information and status tracking',
          'For the waste manager: assigning a collection, changing status and overriding priority',
        ]}
      />
    </>
  )
}
