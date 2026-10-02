import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import { buttonClass } from '../components/ui/styles'
import { paths } from '../routes/paths'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-8 text-center shadow-card">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-canvas text-muted">
        <Icon name="search" className="size-6" />
      </span>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-1 text-muted">This address doesn't match any page in GreenStay.</p>
      <Link to={paths.landing} className={`mt-6 ${buttonClass('primary')}`}>
        Go to the home page
      </Link>
    </div>
  )
}
