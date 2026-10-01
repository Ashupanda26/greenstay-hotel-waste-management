import PageHeader from '../../components/ui/PageHeader'
import PlaceholderPanel from '../../components/ui/PlaceholderPanel'

export default function ReportWastePage() {
  return (
    <>
      <PageHeader title="Report waste" description="Report a waste issue or request a collection." />
      <PlaceholderPanel
        planned={[
          'Waste type, classification (recyclable or non-recyclable) and hotel location',
          'Bin fill level, from which priority is calculated automatically',
          'Submitting a new request with the status Reported',
        ]}
      />
    </>
  )
}
