import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon, { type IconName } from '../../components/ui/Icon'
import PageHeader from '../../components/ui/PageHeader'
import StateMessage from '../../components/ui/StateMessage'
import { buttonClass, fieldErrorClass, inputClass, labelClass, textLinkClass } from '../../components/ui/styles'
import { BIN_FILL_LEVELS, calculatePriority, type BinFillLevel } from '../../lib/businessRules'
import { useDemoStaff } from '../../lib/demoStaff'
import { formatRequestReference } from '../../lib/format'
import { listLocations } from '../../lib/queries/locations'
import { createWasteRequest } from '../../lib/queries/wasteRequests'
import { useAsyncData } from '../../lib/useAsyncData'
import { paths } from '../../routes/paths'
import {
  WASTE_CLASSIFICATIONS,
  WASTE_TYPES,
  type Priority,
  type WasteClassification,
  type WasteType,
} from '../../types/database'

type FormValues = {
  locationId: string
  wasteType: WasteType | ''
  classification: WasteClassification | ''
  fillLevel: FillLevel | ''
  description: string
}

type FieldErrors = Partial<Record<'locationId' | 'wasteType' | 'classification' | 'fillLevel', string>>

const emptyForm: FormValues = { locationId: '', wasteType: '', classification: '', fillLevel: '', description: '' }

const classificationOptions: Record<WasteClassification, { hint: string; icon: IconName }> = {
  Recyclable: { hint: 'Paper, cardboard, plastic, glass and other recyclable materials', icon: 'recycle' },
  'Non-Recyclable': { hint: 'Food waste, general waste and anything that cannot be recycled', icon: 'trash' },
}

const priorityStyles: Record<Priority, string> = {
  High: 'border-danger-200 bg-danger-50 text-danger-700',
  Medium: 'border-warning-200 bg-warning-50 text-warning-700',
  Low: 'border-brand-200 bg-brand-50 text-brand-700',
}

// Staff choose a fill-level category; its representative value is stored in
// bin_level and priority is calculated from it (see BIN_FILL_LEVELS in businessRules.ts).
const fillLevels = BIN_FILL_LEVELS
type FillLevel = BinFillLevel['value']

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.locationId) errors.locationId = 'Choose the location of the bin.'
  if (!values.wasteType) errors.wasteType = 'Choose the type of waste.'
  if (!values.classification) errors.classification = 'Choose whether the waste is recyclable.'
  if (!values.fillLevel) errors.fillLevel = 'Choose how full the bin is.'
  return errors
}

export default function ReportWastePage() {
  const locations = useAsyncData(listLocations)
  const { selected: reporter } = useDemoStaff()

  const [values, setValues] = useState<FormValues>(emptyForm)
  const [showErrors, setShowErrors] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'failed'>('idle')
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const submitting = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  const errors = showErrors ? validate(values) : {}
  const fillLevel = fillLevels.find((option) => option.value === values.fillLevel) ?? null
  const binLevel = fillLevel?.binLevel ?? null
  const priority = binLevel === null ? null : calculatePriority(binLevel)
  const locationName =
    locations.status === 'success' ? locations.data.find((l) => l.id === values.locationId)?.name : undefined

  const update = <K extends keyof FormValues>(field: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return

    const found = validate(values)
    if (Object.keys(found).length > 0 || binLevel === null || !reporter) {
      setShowErrors(true)
      // Move focus to the first field that needs attention, once the errors have rendered.
      setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    submitting.current = true
    setSubmitState('submitting')
    try {
      const created = await createWasteRequest({
        location_id: values.locationId,
        reported_by: reporter.id,
        // validate() has confirmed both are chosen.
        waste_type: values.wasteType as WasteType,
        waste_classification: values.classification as WasteClassification,
        bin_level: binLevel,
        description: values.description.trim() || null,
      })
      setSubmittedId(created.id)
      setSubmitState('idle')
    } catch {
      // Values stay in the form so the user can simply try again.
      setSubmitState('failed')
    } finally {
      submitting.current = false
    }
  }

  function reportAnother() {
    setValues(emptyForm)
    setShowErrors(false)
    setSubmittedId(null)
  }

  const header = (
    <PageHeader eyebrow="Staff" title="Report waste" description="Tell the waste team about a bin that needs collecting." />
  )

  if (submittedId) {
    return (
      <>
        {header}
        <section role="status" className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-6 text-center shadow-raised sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-white">
            <Icon name="check" className="size-7" />
          </span>
          <h2 className="mt-5 text-2xl font-bold">Waste collection request submitted successfully.</h2>
          <p className="mt-4 text-sm text-muted">Your request reference</p>
          <p className="mt-1 inline-block rounded-lg bg-canvas px-4 py-2 font-mono text-2xl font-semibold tracking-wide text-brand-700 ring-1 ring-line">
            {formatRequestReference(submittedId)}
          </p>
          <p className="mt-4 text-muted">A waste manager will review it and arrange a collection.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={paths.staff.requests} className={buttonClass('primary', 'lg')}>
              View My Requests
            </Link>
            <button type="button" onClick={reportAnother} className={buttonClass('secondary', 'lg')}>
              Report another
            </button>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {header}
      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="space-y-5">
          <p className="text-sm text-muted">All fields are required unless marked optional.</p>

          <FormSection number={1} title="Location" icon="location">
            <label htmlFor="location" className={labelClass}>
              Where is the bin?
            </label>
            {locations.status === 'loading' && (
              <div role="status" className="mt-2 h-11 animate-pulse rounded-lg bg-canvas">
                <span className="sr-only">Loading locations…</span>
              </div>
            )}
            {locations.status === 'error' && (
              <div className="mt-2">
                <StateMessage kind="error" title="We couldn't load hotel locations.">
                  Check your connection and{' '}
                  <button type="button" onClick={locations.retry} className={textLinkClass}>
                    try again
                  </button>
                  .
                </StateMessage>
              </div>
            )}
            {locations.status === 'success' && locations.data.length === 0 && (
              <div className="mt-2">
                <StateMessage kind="empty" title="No locations have been set up yet.">
                  Ask the waste manager to add hotel locations before reporting waste.
                </StateMessage>
              </div>
            )}
            {locations.status === 'success' && locations.data.length > 0 && (
              <select
                id="location"
                value={values.locationId}
                onChange={(event) => update('locationId', event.target.value)}
                aria-invalid={!!errors.locationId}
                aria-describedby={errors.locationId ? 'location-error' : undefined}
                className={`mt-2 ${inputClass}`}
              >
                <option value="">Choose a location</option>
                {locations.data.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            )}
            {errors.locationId && locations.status === 'success' && (
              <FieldError id="location-error">{errors.locationId}</FieldError>
            )}
          </FormSection>

          <FormSection number={2} title="Waste details" icon="trash">
            <label htmlFor="waste-type" className={labelClass}>
              Waste type
            </label>
            <select
              id="waste-type"
              value={values.wasteType}
              onChange={(event) => update('wasteType', event.target.value as WasteType | '')}
              aria-invalid={!!errors.wasteType}
              aria-describedby={errors.wasteType ? 'waste-type-error' : undefined}
              className={`mt-2 ${inputClass}`}
            >
              <option value="">Choose a waste type</option>
              {WASTE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.wasteType && <FieldError id="waste-type-error">{errors.wasteType}</FieldError>}

            <fieldset className="mt-5" aria-describedby={errors.classification ? 'classification-error' : undefined}>
              <legend className={labelClass}>Classification</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {WASTE_CLASSIFICATIONS.map((classification) => (
                  <label
                    key={classification}
                    className={[
                      'flex cursor-pointer gap-3 rounded-xl border bg-surface p-4 transition-colors',
                      'hover:border-brand-500 has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:ring-1 has-checked:ring-brand-600',
                      'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-600',
                      errors.classification ? 'border-danger-500' : 'border-line-strong',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="classification"
                      value={classification}
                      checked={values.classification === classification}
                      onChange={() => update('classification', classification)}
                      aria-invalid={!!errors.classification}
                      className="mt-1 size-4 accent-brand-600 focus-visible:outline-none"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Icon name={classificationOptions[classification].icon} className="size-4 text-brand-700" />
                        {classification}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">{classificationOptions[classification].hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.classification && <FieldError id="classification-error">{errors.classification}</FieldError>}
            </fieldset>

            <label htmlFor="description" className={`mt-5 ${labelClass}`}>
              Description <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Add any useful details about the waste or collection location..."
              className={`mt-2 ${inputClass}`}
            />
          </FormSection>

          <FormSection number={3} title="Bin fill level" icon="gauge">
            <fieldset aria-describedby={errors.fillLevel ? 'fill-level-hint fill-level-error' : 'fill-level-hint'}>
              <legend className={labelClass}>How full is the bin?</legend>
              <div className="mt-2 grid gap-2">
                {fillLevels.map((option) => (
                  <label
                    key={option.value}
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-xl border bg-surface px-4 py-2.5 transition-colors',
                      'hover:border-brand-500 has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:ring-1 has-checked:ring-brand-600',
                      'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-600',
                      errors.fillLevel ? 'border-danger-500' : 'border-line-strong',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="fillLevel"
                      value={option.value}
                      checked={values.fillLevel === option.value}
                      onChange={() => update('fillLevel', option.value)}
                      aria-invalid={!!errors.fillLevel}
                      className="size-4 accent-brand-600 focus-visible:outline-none"
                    />
                    <span className="font-semibold">{option.value}</span>
                    <span className="ml-auto text-sm whitespace-nowrap text-muted tabular-nums">{option.range}</span>
                  </label>
                ))}
              </div>
              <p id="fill-level-hint" className="mt-2 text-sm text-muted">
                Select the option that best matches how full the bin is.
              </p>
              {errors.fillLevel && <FieldError id="fill-level-error">{errors.fillLevel}</FieldError>}
            </fieldset>
          </FormSection>
        </div>

        {/* Summary, calculated priority and submit */}
        <aside className="space-y-4 lg:sticky lg:top-36">
          <section aria-labelledby="priority-heading" className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <StepNumber number={4} />
              <h2 id="priority-heading" className="font-semibold">
                Priority
              </h2>
            </div>
            <div
              aria-live="polite"
              className={[
                'mt-4 rounded-xl border p-4 text-center',
                priority ? priorityStyles[priority] : 'border-dashed border-line-strong bg-canvas text-muted',
              ].join(' ')}
            >
              {priority ? (
                <>
                  <p className="text-xs font-semibold tracking-wider uppercase opacity-80">
                    Bin fill level {fillLevel?.value} · {fillLevel?.range}
                  </p>
                  <p className="mt-2 flex items-center justify-center gap-2 font-display text-3xl font-bold tracking-wide uppercase">
                    <Icon name="flag" className="size-6" />
                    {priority}
                  </p>
                  <p className="text-xs font-semibold tracking-wider uppercase">priority</p>
                </>
              ) : (
                <p className="text-sm">Choose the bin fill level to calculate priority.</p>
              )}
            </div>
            <p className="mt-3 text-xs text-muted">Calculated automatically from the bin fill level.</p>
          </section>

          <section aria-label="Summary and submit" className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <dl className="space-y-2 text-sm">
              <SummaryRow label="Reporting as" value={reporter?.name} />
              <SummaryRow label="Location" value={locationName} />
              <SummaryRow label="Waste" value={values.wasteType || undefined} />
              <SummaryRow label="Classification" value={values.classification || undefined} />
            </dl>

            {submitState === 'failed' && (
              <div role="alert" className="mt-4 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
                <p className="font-semibold">We couldn't submit your request. Please try again.</p>
                <p>Your answers have been kept.</p>
              </div>
            )}
            {showErrors && !reporter && (
              <p role="alert" className={fieldErrorClass}>
                Choose a demo staff member in the header before submitting.
              </p>
            )}

            <button
              type="submit"
              disabled={submitState === 'submitting'}
              className={`mt-5 w-full ${buttonClass('primary', 'lg')}`}
            >
              {submitState === 'submitting' ? (
                <>
                  <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting…
                </>
              ) : (
                'Submit request'
              )}
            </button>
          </section>
        </aside>
      </form>
    </>
  )
}

function StepNumber({ number }: { number: number }) {
  return (
    <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
      {number}
    </span>
  )
}

function FormSection({ number, title, icon, children }: { number: number; title: string; icon: IconName; children: ReactNode }) {
  const id = `section-${number}`
  return (
    <section aria-labelledby={id} className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <StepNumber number={number} />
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        <Icon name={icon} className="ml-auto size-5 text-muted" />
      </div>
      {children}
    </section>
  )
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className={fieldErrorClass}>
      <Icon name="alert" className="size-4" />
      {children}
    </p>
  )
}

function SummaryRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${value ? 'font-semibold' : 'text-muted'}`}>{value ?? '—'}</dd>
    </div>
  )
}
