import { Link } from 'react-router-dom'
import Icon, { type IconName } from '../components/ui/Icon'
import { buttonClass } from '../components/ui/styles'
import { useDemoStaff } from '../lib/demoStaff'
import { paths } from '../routes/paths'

const lifecycle: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'report', title: 'Report', detail: 'Staff log a full bin' },
  { icon: 'gauge', title: 'Priority calculated', detail: 'From the bin fill level' },
  { icon: 'search', title: 'Manager reviews', detail: 'Request queue and filters' },
  { icon: 'truck', title: 'Collection assigned', detail: 'Collector and date set' },
  { icon: 'check', title: 'Collection completed', detail: 'Time recorded' },
  { icon: 'analytics', title: 'Analytics', detail: 'Trends, types and locations' },
]

const steps: { number: string; icon: IconName; title: string; points: string[] }[] = [
  { number: '01', icon: 'report', title: 'Report waste', points: ['Location', 'Waste type', 'Recyclable or not', 'Bin fill level'] },
  { number: '02', icon: 'flag', title: 'Prioritise', points: ['0–49% → Low', '50–89% → Medium', '90–100% → High'] },
  { number: '03', icon: 'truck', title: 'Manage collection', points: ['Review requests', 'Assign a collector', 'Schedule and start', 'Complete or cancel'] },
  { number: '04', icon: 'analytics', title: 'Analyse', points: ['Reporting trends', 'Types and locations', 'Priorities', 'Collection status'] },
]

const priorityChips = [
  { label: 'Low', range: '0–49%', className: 'bg-brand-50 text-brand-700 ring-brand-200' },
  { label: 'Medium', range: '50–89%', className: 'bg-warning-50 text-warning-700 ring-warning-200' },
  { label: 'High', range: '90–100%', className: 'bg-danger-50 text-danger-700 ring-danger-200' },
]

export default function LandingPage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <Hero />
      <HowItWorks />
      <ChooseRole />
    </div>
  )
}

function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="grid items-center gap-10 pt-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pt-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 ring-inset">
          <Icon name="leaf" className="size-3.5" />
          Hotel Operations Demo
        </span>
        <h1 id="hero-heading" className="mt-4 text-4xl leading-[1.1] font-bold sm:text-5xl">
          Smarter waste management for hotel operations.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          GreenStay helps hotel teams report waste, prioritise collections, manage requests and understand waste
          activity through one simple workflow.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#choose-role" className={buttonClass('primary', 'lg')}>
            Choose a demo role
            <Icon name="arrowDown" className="size-4" />
          </a>
          <a href="#how-it-works" className={buttonClass('secondary', 'lg')}>
            How it works
          </a>
        </div>
      </div>

      {/* Product-style workflow diagram */}
      <figure className="rounded-2xl border border-line bg-surface p-5 shadow-raised sm:p-6">
        <figcaption className="flex items-center justify-between">
          <span className="text-sm font-semibold">Request lifecycle</span>
          <span className="text-xs text-muted">One workflow, two roles</span>
        </figcaption>
        <ol className="mt-5 space-y-0">
          {lifecycle.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
              {index < lifecycle.length - 1 && (
                <span aria-hidden="true" className="absolute top-10 bottom-1 left-[19px] w-0.5 bg-brand-100" />
              )}
              <span
                className={[
                  'relative grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset',
                  index === lifecycle.length - 1 ? 'bg-brand-600 text-white ring-brand-600' : 'bg-brand-50 text-brand-700 ring-brand-200',
                ].join(' ')}
              >
                <Icon name={step.icon} className="size-5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted">{step.detail}</p>
                {step.title === 'Priority calculated' && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {priorityChips.map((chip) => (
                      <span key={chip.label} className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${chip.className}`}>
                        {chip.label} {chip.range}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </figure>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-24">
      <h2 id="how-heading" className="text-2xl font-bold sm:text-3xl">
        How GreenStay works
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.number} className="relative rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name={step.icon} className="size-5" />
              </span>
              <span className="font-display text-2xl font-bold text-line-strong">{step.number}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {step.points.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-1 rounded-full bg-brand-500" />
                  {point}
                </li>
              ))}
            </ul>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 -right-3 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-brand-600 lg:grid"
              >
                <Icon name="arrowRight" className="size-3.5" />
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function ChooseRole() {
  const { staff, selected, select } = useDemoStaff()

  const roleCard =
    'group flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-raised sm:p-7'

  return (
    <section id="choose-role" aria-labelledby="role-heading" className="scroll-mt-24 pb-4">
      <div className="max-w-2xl">
        <h2 id="role-heading" className="text-2xl font-bold sm:text-3xl">
          Choose how you want to explore GreenStay
        </h2>
        <p className="mt-2 text-muted">Select a demo role to explore the system. No sign-in is needed.</p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <article className={roleCard}>
          <RoleHeading icon="user" title="Staff" />
          <p className="mt-3 text-muted">Report waste from hotel locations and track your submitted requests.</p>
          <Tags items={['Report waste', 'Track requests', 'View status']} />

          <div className="mt-auto pt-6">
            {staff.status === 'success' && staff.data.length > 0 && (
              <div className="mb-4">
                <label htmlFor="landing-staff" className="text-sm font-semibold">
                  Demo staff member
                </label>
                <select
                  id="landing-staff"
                  value={selected?.id ?? ''}
                  onChange={(event) => select(event.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm shadow-card hover:border-muted/60"
                >
                  {staff.data.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                      {member.department ? ` — ${member.department}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Link to={paths.staff.dashboard} className={`w-full ${buttonClass('primary', 'lg')}`}>
              Continue as Staff
              <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>

        <article className={roleCard}>
          <RoleHeading icon="manager" title="Waste Manager" />
          <p className="mt-3 text-muted">Manage waste requests, organise collections and analyse operational activity.</p>
          <Tags items={['Manage requests', 'Schedule collections', 'Analytics']} />
          <div className="mt-auto pt-6">
            <p className="mb-4 text-sm text-muted">You'll act as the demo waste manager.</p>
            <Link to={paths.manager.dashboard} className={`w-full ${buttonClass('primary', 'lg')}`}>
              Continue as Waste Manager
              <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}

function RoleHeading({ icon, title }: { icon: IconName; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon name={icon} className="size-6" />
      </span>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
  )
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul aria-label="What you can do" className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink ring-1 ring-line ring-inset">
          {item}
        </li>
      ))}
    </ul>
  )
}
