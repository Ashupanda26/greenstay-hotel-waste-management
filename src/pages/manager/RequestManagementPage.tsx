import PageHeader from '../../components/ui/PageHeader'
import PlaceholderPanel from '../../components/ui/PlaceholderPanel'

export default function RequestManagementPage() {
  return (
    <>
      <PageHeader title="Request management" description="Every waste request from every location." />
      <PlaceholderPanel
        planned={['All waste requests', 'Filtering requests', 'Opening a request to manage it']}
      />
    </>
  )
}
