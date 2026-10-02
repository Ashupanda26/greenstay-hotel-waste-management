import { useDemoStaff } from '../../lib/demoStaff'
import type { WorkspaceId } from '../layout/navigation'
import Icon from '../ui/Icon'

// Subtle reminder that there is no real login.
export function DemoModeTag() {
  return (
    <span
      title="Demo mode: there is no login. Choose a demo role to explore GreenStay."
      className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-1 text-xs font-semibold text-warning-700 ring-1 ring-warning-200 ring-inset"
    >
      <Icon name="info" className="size-3.5" />
      Demo mode
    </span>
  )
}

/**
 * Who the visitor is acting as. In the staff workspace this is a selector of
 * the seeded staff members (see lib/demoStaff.ts); managers act as a generic demo manager.
 */
export function DemoActor({ workspace, idPrefix }: { workspace: WorkspaceId; idPrefix: string }) {
  const { staff, selected, select } = useDemoStaff()

  if (workspace === 'manager') {
    return (
      <span className="inline-flex items-center gap-2 text-sm">
        <span className="grid size-7 place-items-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="manager" className="size-4" />
        </span>
        <span>
          <span className="font-semibold">Waste Manager</span>
          <span className="text-muted"> · Demo</span>
        </span>
      </span>
    )
  }

  const id = `${idPrefix}-demo-staff`
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Icon name="user" className="size-4" />
      </span>
      <label htmlFor={id} className="font-semibold">
        Staff<span className="sr-only"> member you are acting as (demo)</span>
      </label>
      {staff.status === 'loading' && <span className="text-muted">Loading…</span>}
      {staff.status === 'error' && (
        <button type="button" onClick={staff.retry} className="font-semibold text-danger-700 underline underline-offset-4">
          Couldn't load staff. Retry
        </button>
      )}
      {staff.status === 'success' && (
        <select
          id={id}
          value={selected?.id ?? ''}
          onChange={(event) => select(event.target.value)}
          className="max-w-44 rounded-md border border-line-strong bg-surface py-1 pr-7 pl-2 text-sm hover:border-muted/60"
        >
          {staff.data.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      )}
    </span>
  )
}
