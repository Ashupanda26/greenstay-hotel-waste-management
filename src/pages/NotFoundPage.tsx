import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import { paths } from '../routes/paths'

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" description="This address doesn't match any page in GreenStay." />
      <Link to={paths.landing} className="font-bold text-moss underline underline-offset-4">
        Go to the home page
      </Link>
    </>
  )
}
