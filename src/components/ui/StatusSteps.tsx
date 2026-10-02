import type { RequestStatus } from '../../types/database'
import Icon from './Icon'

const steps: RequestStatus[] = ['Reported', 'Assigned', 'Scheduled', 'In Progress', 'Completed']

// Shows where a request is in the workflow. Each step is labelled in text
// (done / current / not yet) for screen readers, so meaning doesn't depend on colour.
export default function StatusSteps({ status }: { status: RequestStatus }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-canvas px-4 py-3 text-sm">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-muted ring-1 ring-line">
          <Icon name="x" className="size-4" />
        </span>
        <p>
          <strong className="font-semibold">Cancelled.</strong>{' '}
          <span className="text-muted">This request was stopped before collection and needs no further action.</span>
        </p>
      </div>
    )
  }

  const current = steps.indexOf(status)
  return (
    <ol aria-label="Request progress" className="grid grid-cols-5">
      {steps.map((step, index) => {
        const done = index < current || status === 'Completed'
        const isCurrent = index === current && status !== 'Completed'
        return (
          <li key={step} aria-current={index === current ? 'step' : undefined} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2 ${index <= current ? 'bg-brand-600' : 'bg-line'}`}
              />
            )}
            <span
              className={[
                'relative z-10 grid size-8 place-items-center rounded-full text-sm font-semibold transition-colors',
                done ? 'bg-brand-600 text-white' : isCurrent ? 'bg-surface text-brand-700 ring-2 ring-brand-600' : 'bg-surface text-muted ring-1 ring-line-strong',
              ].join(' ')}
            >
              {done ? <Icon name="check" className="size-4" /> : index + 1}
            </span>
            <span className={`mt-2 text-xs leading-tight sm:text-sm ${isCurrent || done ? 'font-semibold text-ink' : 'text-muted'}`}>
              {step}
            </span>
            <span className="sr-only">{index === current ? ' (current)' : done ? ' (done)' : ' (not yet)'}</span>
          </li>
        )
      })}
    </ol>
  )
}
