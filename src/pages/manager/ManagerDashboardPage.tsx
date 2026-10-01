import PageHeader from '../../components/ui/PageHeader'
import PlaceholderPanel from '../../components/ui/PlaceholderPanel'

export default function ManagerDashboardPage() {
  return (
    <>
      <PageHeader title="Manager dashboard" description="Monitor waste requests across the hotel." />
      <PlaceholderPanel planned={['Key performance indicators', 'Requests needing attention']} />
    </>
  )
}
