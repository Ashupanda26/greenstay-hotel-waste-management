import PageHeader from '../../components/ui/PageHeader'
import PlaceholderPanel from '../../components/ui/PlaceholderPanel'

export default function StaffDashboardPage() {
  return (
    <>
      <PageHeader title="Staff dashboard" description="Your waste requests at a glance." />
      <PlaceholderPanel
        planned={[
          'Summary of your requests by status',
          'Shortcuts to report waste and request a collection',
        ]}
      />
    </>
  )
}
