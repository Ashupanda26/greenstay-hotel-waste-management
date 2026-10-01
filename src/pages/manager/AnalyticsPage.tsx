import PageHeader from '../../components/ui/PageHeader'
import PlaceholderPanel from '../../components/ui/PlaceholderPanel'

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Trends in waste volume, type and handling." />
      <PlaceholderPanel planned={['Charts built from request and collection data']} />
    </>
  )
}
