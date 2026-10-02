import { useRef, useState, type ReactNode } from 'react'
import Icon, { type IconName } from '../ui/Icon'
import { buttonClass, fieldErrorClass, inputClass, labelClass, textLinkClass } from '../ui/styles'
import {
  binFillLevelFor,
  calculatePriority,
  canAssignRequest,
  canCancelCollection,
  canChangePriority,
  canCompleteCollection,
  canScheduleCollection,
  canStartCollection,
  isOpenRequest,
  validateScheduledDate,
  type WorkflowState,
} from '../../lib/businessRules'
import { todayIsoDate } from '../../lib/format'
import {
  assignCollection,
  cancelCollection,
  completeCollection,
  scheduleCollection,
  startCollection,
} from '../../lib/queries/collections'
import { listWasteManagers } from '../../lib/queries/users'
import { updateRequestPriority, type WasteRequestDetails } from '../../lib/queries/wasteRequests'
import { useAsyncData } from '../../lib/useAsyncData'
import { PRIORITIES, type Priority } from '../../types/database'

type ManageRequestPanelProps = {
  request: WasteRequestDetails
  /** Called after a successful change so the page can reload the request. */
  onChanged: () => void
}

type Feedback = { kind: 'success' | 'error'; message: string }

// Waste manager actions for one request. Which actions appear is decided by
// the workflow rules in lib/businessRules.ts.
export default function ManageRequestPanel({ request, onChanged }: ManageRequestPanelProps) {
  const managers = useAsyncData(listWasteManagers)
  const collection = request.collection
  const workflow: WorkflowState = { status: request.status, collection }

  const [busyAction, setBusyAction] = useState<string | null>(null)
  const busy = useRef(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [confirming, setConfirming] = useState<'complete' | 'cancel' | null>(null)

  const [assigneeId, setAssigneeId] = useState(collection?.assigned_to ?? '')
  const [assigneeError, setAssigneeError] = useState<string | null>(null)
  const [date, setDate] = useState(collection?.scheduled_date ?? '')
  const [dateError, setDateError] = useState<string | null>(null)
  const [priority, setPriority] = useState<Priority>(request.priority)

  /** Runs one change at a time, then reports the outcome and reloads the request. */
  async function run(key: string, change: () => Promise<void>, successMessage: string) {
    if (busy.current) return
    busy.current = true
    setBusyAction(key)
    setFeedback(null)
    try {
      await change()
      setFeedback({ kind: 'success', message: successMessage })
      onChanged()
    } catch {
      setFeedback({ kind: 'error', message: "We couldn't update this request. Please try again." })
    } finally {
      busy.current = false
      setBusyAction(null)
      setConfirming(null)
    }
  }

  function handleAssign() {
    if (!assigneeId) {
      setAssigneeError('Choose a waste manager to collect this request.')
      return
    }
    setAssigneeError(null)
    const name = managers.status === 'success' ? managers.data.find((m) => m.id === assigneeId)?.name : undefined
    void run('assign', () => assignCollection(request.id, assigneeId), `Collection assigned${name ? ` to ${name}` : ''}.`)
  }

  function handleSchedule() {
    const problem = validateScheduledDate(date, todayIsoDate())
    setDateError(problem)
    if (problem || !collection) return
    void run('schedule', () => scheduleCollection(request.id, collection.id, date), 'Collection scheduled.')
  }

  const isBusy = busyAction !== null
  const calculated = calculatePriority(request.bin_level)
  const anyAction =
    canAssignRequest(workflow) ||
    canScheduleCollection(workflow) ||
    canStartCollection(workflow) ||
    canCompleteCollection(workflow) ||
    canCancelCollection(workflow)

  return (
    <section aria-labelledby="manage-heading" className="rounded-xl border border-line bg-surface shadow-card">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h2 id="manage-heading" className="flex items-center gap-2 text-lg font-semibold">
          <Icon name="manager" className="size-5 text-brand-700" />
          Manage request
        </h2>
        <p className="mt-0.5 text-sm text-muted">Actions available at the current stage.</p>
      </div>

      <div className="px-5 sm:px-6">
        <div aria-live="polite" className="empty:hidden">
          {feedback && (
            <p
              role={feedback.kind === 'error' ? 'alert' : undefined}
              className={[
                'mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold',
                feedback.kind === 'error' ? 'border-danger-200 bg-danger-50 text-danger-700' : 'border-brand-200 bg-brand-50 text-brand-700',
              ].join(' ')}
            >
              <Icon name={feedback.kind === 'error' ? 'alert' : 'check'} className="size-4" />
              {feedback.message}
            </p>
          )}
        </div>

        {!anyAction && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-canvas px-3 py-3 text-sm text-muted">
            <Icon name="info" className="mt-0.5 size-4" />
            <span>
              This request is <strong className="text-ink">{request.status}</strong>. No further collection actions are needed.
            </span>
          </p>
        )}

        <div className="divide-y divide-line">
          {canAssignRequest(workflow) && (
            <Action icon="user" title={collection ? 'Reassign collector' : 'Assign collection'}>
              {managers.status === 'loading' && <p className="text-sm text-muted">Loading waste managers…</p>}
              {managers.status === 'error' && (
                <p role="alert" className="text-sm">
                  Couldn't load waste managers.{' '}
                  <button type="button" onClick={managers.retry} className={textLinkClass}>
                    Try again
                  </button>
                </p>
              )}
              {managers.status === 'success' && (
                <>
                  <label htmlFor="assignee" className={labelClass}>
                    Collector (waste manager)
                  </label>
                  <select
                    id="assignee"
                    value={assigneeId}
                    onChange={(event) => {
                      setAssigneeId(event.target.value)
                      setAssigneeError(null)
                    }}
                    aria-invalid={!!assigneeError}
                    aria-describedby={assigneeError ? 'assignee-error' : undefined}
                    className={`mt-1.5 ${inputClass}`}
                  >
                    <option value="">Choose a waste manager</option>
                    {managers.data.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                  {assigneeError && (
                    <p id="assignee-error" className={fieldErrorClass}>
                      <Icon name="alert" className="size-4" />
                      {assigneeError}
                    </p>
                  )}
                  <button type="button" onClick={handleAssign} disabled={isBusy} className={`mt-3 w-full ${buttonClass('primary')}`}>
                    {busyAction === 'assign' ? 'Assigning…' : collection ? 'Reassign collection' : 'Assign collection'}
                  </button>
                </>
              )}
            </Action>
          )}

          {canScheduleCollection(workflow) && collection && (
            <Action icon="calendar" title={request.status === 'Scheduled' ? 'Reschedule collection' : 'Schedule collection'}>
              <label htmlFor="scheduled-date" className={labelClass}>
                Collection date
              </label>
              <input
                id="scheduled-date"
                type="date"
                min={todayIsoDate()}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  setDateError(null)
                }}
                aria-invalid={!!dateError}
                aria-describedby={dateError ? 'scheduled-date-error' : undefined}
                className={`mt-1.5 ${inputClass}`}
              />
              {dateError && (
                <p id="scheduled-date-error" className={fieldErrorClass}>
                  <Icon name="alert" className="size-4" />
                  {dateError}
                </p>
              )}
              <button type="button" onClick={handleSchedule} disabled={isBusy} className={`mt-3 w-full ${buttonClass('primary')}`}>
                {busyAction === 'schedule' ? 'Scheduling…' : 'Schedule collection'}
              </button>
            </Action>
          )}

          {canStartCollection(workflow) && collection && (
            <Action icon="play" title="Start collection">
              <p className="text-sm text-muted">Use this when the collector begins collecting the waste.</p>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void run('start', () => startCollection(request.id, collection.id), 'Collection started.')}
                className={`mt-3 w-full ${buttonClass('primary')}`}
              >
                {busyAction === 'start' ? 'Starting…' : 'Start collection'}
              </button>
            </Action>
          )}

          {canCompleteCollection(workflow) && collection && (
            <Action icon="check" title="Complete collection">
              {confirming === 'complete' ? (
                <Confirm
                  message="Mark this collection as completed? It will be recorded as collected now, and this can't be undone."
                  confirmLabel="Yes, mark as completed"
                  cancelLabel="No, keep in progress"
                  busyLabel="Completing…"
                  busy={busyAction === 'complete'}
                  disabled={isBusy}
                  onConfirm={() =>
                    void run('complete', () => completeCollection(request.id, collection.id), 'Collection marked as completed.')
                  }
                  onCancel={() => setConfirming(null)}
                />
              ) : (
                <button type="button" disabled={isBusy} onClick={() => setConfirming('complete')} className={`w-full ${buttonClass('primary')}`}>
                  Mark as completed
                </button>
              )}
            </Action>
          )}

          {canChangePriority(request.status) && (
            <Action icon="flag" title="Priority override">
              <p className="text-sm text-muted">
                Calculated from the bin fill level ({binFillLevelFor(request.bin_level).value} ·{' '}
                {binFillLevelFor(request.bin_level).range}): <strong className="text-ink">{calculated}</strong>.
              </p>
              <label htmlFor="priority" className={`mt-3 ${labelClass}`}>
                Priority
              </label>
              <div className="mt-1.5 flex gap-2">
                <select
                  id="priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as Priority)}
                  className={inputClass}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isBusy || priority === request.priority}
                  onClick={() =>
                    void run('priority', () => updateRequestPriority(request.id, priority), `Priority changed to ${priority}.`)
                  }
                  className={`shrink-0 ${buttonClass('secondary')}`}
                >
                  {busyAction === 'priority' ? 'Saving…' : 'Update'}
                </button>
              </div>
            </Action>
          )}

          {canCancelCollection(workflow) && (
            <Action icon="x" title="Cancel request" tone="danger">
              {confirming === 'cancel' ? (
                <Confirm
                  message={`Cancel this request${collection ? ' and its collection' : ''}? This can't be undone.`}
                  confirmLabel="Yes, cancel request"
                  cancelLabel="No, keep it"
                  busyLabel="Cancelling…"
                  danger
                  busy={busyAction === 'cancel'}
                  disabled={isBusy}
                  onConfirm={() =>
                    void run('cancel', () => cancelCollection(request.id, collection?.id ?? null), 'Request cancelled.')
                  }
                  onCancel={() => setConfirming(null)}
                />
              ) : (
                <button type="button" disabled={isBusy} onClick={() => setConfirming('cancel')} className={`w-full ${buttonClass('danger')}`}>
                  Cancel request
                </button>
              )}
            </Action>
          )}
        </div>

        {isOpenRequest(request.status) && !canCompleteCollection(workflow) && (
          <p className="border-t border-line py-4 text-xs text-muted">
            Collections move through Assigned, Scheduled and In Progress before they can be completed.
          </p>
        )}
      </div>
    </section>
  )
}

function Action({ icon, title, tone = 'default', children }: { icon: IconName; title: string; tone?: 'default' | 'danger'; children: ReactNode }) {
  return (
    <div className="py-5">
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${tone === 'danger' ? 'text-danger-700' : ''}`}>
        <span className={`grid size-7 place-items-center rounded-lg ${tone === 'danger' ? 'bg-danger-50' : 'bg-brand-50 text-brand-700'}`}>
          <Icon name={icon} className="size-4" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  )
}

type ConfirmProps = {
  message: string
  confirmLabel: string
  cancelLabel: string
  busyLabel: string
  busy: boolean
  disabled: boolean
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// A simple inline "are you sure?" step for actions that can't be undone.
function Confirm({ message, confirmLabel, cancelLabel, busyLabel, busy, disabled, danger, onConfirm, onCancel }: ConfirmProps) {
  return (
    <div role="group" aria-label="Confirm action" className="rounded-lg border border-warning-200 bg-warning-50 p-3">
      <p className="flex items-start gap-2 text-sm font-semibold text-warning-700">
        <Icon name="alert" className="mt-0.5 size-4" />
        {message}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" autoFocus disabled={disabled} onClick={onConfirm} className={buttonClass(danger ? 'danger' : 'primary', 'sm')}>
          {busy ? busyLabel : confirmLabel}
        </button>
        <button type="button" disabled={disabled} onClick={onCancel} className={buttonClass('secondary', 'sm')}>
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}
