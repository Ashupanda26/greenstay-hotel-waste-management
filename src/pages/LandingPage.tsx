import { Link } from 'react-router-dom'
import { paths } from '../routes/paths'

const entryLinkClass =
  'block rounded-lg border border-forest/15 bg-white p-5 transition-colors hover:border-moss'

export default function LandingPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold leading-tight text-forest sm:text-5xl">
        Waste collection for GreenStay Birmingham Hotel
      </h1>
      <p className="mt-4 text-lg text-ink/80">
        Staff report full bins and request collections. The waste manager assigns, schedules and
        tracks every request through to completion.
      </p>
      <p className="mt-3 text-sm text-ink/60">
        A portfolio demonstration built for a fictional hotel.
      </p>

      {/* Temporary entry points. Replaced by the Demo Role Selector in a later phase. */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link to={paths.staff.dashboard} className={entryLinkClass}>
          <span className="font-display text-xl font-bold text-forest">Staff area</span>
          <span className="mt-1 block text-ink/70">Housekeeping, Kitchen and Front Desk</span>
        </Link>
        <Link to={paths.manager.dashboard} className={entryLinkClass}>
          <span className="font-display text-xl font-bold text-forest">Waste manager area</span>
          <span className="mt-1 block text-ink/70">Requests, collections and analytics</span>
        </Link>
      </div>
    </div>
  )
}
