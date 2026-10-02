import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import StateMessage from '../../components/ui/StateMessage'
import Icon from '../../components/ui/Icon'
import KpiCard from '../../components/ui/KpiCard'
import { buttonClass, inputClass, textLinkClass } from '../../components/ui/styles'
import ChartCard from '../../components/analytics/ChartCard'
import LocationSummaryTable from '../../components/analytics/LocationSummaryTable'
import { ClassificationDonut, HorizontalBars, TrendChart } from '../../components/analytics/AnalyticsCharts'
import { chartColors } from '../../components/analytics/chartColors'
import {
  DATE_RANGES,
  averageCompletionTime,
  buildTrend,
  calculateKpis,
  defaultAnalyticsFilters,
  filterAnalyticsRequests,
  formatDuration,
  formatPercent,
  generateInsights,
  summariseByClassification,
  summariseByLocation,
  summariseByPriority,
  summariseByWasteType,
  summariseCollections,
  type AnalyticsFilters,
  type AnalyticsRequest,
  type DateRange,
} from '../../lib/analytics'
import { getAnalyticsData } from '../../lib/queries/analytics'
import type { LocationOption } from '../../lib/queries/locations'
import { useAsyncData } from '../../lib/useAsyncData'
import {
  PRIORITIES,
  WASTE_CLASSIFICATIONS,
  WASTE_TYPES,
  type Priority,
  type WasteClassification,
  type WasteType,
} from '../../types/database'

// Filters live in the URL (as on the request queue), so a filtered view can be
// bookmarked or shared. Missing or unknown values fall back to the defaults.
const paramKeys = {
  range: 'range',
  locationId: 'location',
  wasteType: 'wasteType',
  classification: 'classification',
  priority: 'priority',
} as const satisfies Record<keyof AnalyticsFilters, string>

function readFilters(params: URLSearchParams): AnalyticsFilters {
  const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T | '') => {
    const value = params.get(key)
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
  }
  const range = pick<DateRange>(paramKeys.range, DATE_RANGES.map((r) => r.value), '')
  return {
    range: range || defaultAnalyticsFilters.range,
    locationId: params.get(paramKeys.locationId) ?? '',
    wasteType: pick<WasteType>(paramKeys.wasteType, WASTE_TYPES, ''),
    classification: pick<WasteClassification>(paramKeys.classification, WASTE_CLASSIFICATIONS, ''),
    priority: pick<Priority>(paramKeys.priority, PRIORITIES, ''),
  }
}

const priorityColors: Record<Priority, string> = {
  Low: chartColors.brandLight,
  Medium: chartColors.warning,
  High: chartColors.danger,
}

export default function AnalyticsPage() {
  const data = useAsyncData(getAnalyticsData)
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const isDefault = (Object.keys(filters) as (keyof AnalyticsFilters)[]).every(
    (key) => filters[key] === defaultAnalyticsFilters[key],
  )

  const setFilter = (key: keyof AnalyticsFilters, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value && value !== defaultAnalyticsFilters[key]) next.set(paramKeys[key], value)
        else next.delete(paramKeys[key])
        return next
      },
      { replace: true },
    )
  const resetFilters = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <>
      <PageHeader
        eyebrow="Waste Manager"
        title="Analytics"
        description="Waste reporting trends, types, locations and collection progress."
      />

      <FilterBar
        filters={filters}
        locations={data.status === 'success' ? data.data.locations : null}
        canReset={!isDefault}
        onChange={setFilter}
        onReset={resetFilters}
      />

      {data.status === 'loading' && <LoadingSkeleton />}

      {data.status === 'error' && (
        <StateMessage kind="error" title="We couldn't load analytics right now. Please try again.">
          <button type="button" onClick={data.retry} className={textLinkClass}>
            Try again
          </button>
        </StateMessage>
      )}

      {data.status === 'success' && (
        <AnalyticsResults requests={data.data.requests} now={data.data.loadedAt} filters={filters} onReset={resetFilters} />
      )}
    </>
  )
}

type FilterBarProps = {
  filters: AnalyticsFilters
  /** null while locations are loading. */
  locations: LocationOption[] | null
  canReset: boolean
  onChange: (key: keyof AnalyticsFilters, value: string) => void
  onReset: () => void
}

/** A compact toolbar. Each select has a (visually hidden) label; the option text names the filter too. */
function FilterBar({ filters, locations, canReset, onChange, onReset }: FilterBarProps) {
  const select = (key: keyof AnalyticsFilters, label: string, options: { value: string; label: string }[], allLabel?: string) => {
    const isSet = filters[key] !== defaultAnalyticsFilters[key]
    return (
      <div>
        <label htmlFor={`analytics-${key}`} className="sr-only">
          {label}
        </label>
        <select
          id={`analytics-${key}`}
          value={filters[key]}
          onChange={(event) => onChange(key, event.target.value)}
          disabled={key === 'locationId' && locations === null}
          className={`${inputClass} py-2 ${isSet ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700' : ''}`}
        >
          {allLabel && <option value="">{allLabel}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
  const plain = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }))

  return (
    <section aria-label="Analytics filters" className="mb-6 rounded-xl border border-line bg-surface p-3 shadow-card sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <p className="flex shrink-0 items-center gap-2 text-sm font-semibold">
          <Icon name="filter" className="size-4 text-muted" />
          Filters
        </p>
        <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {select('range', 'Date reported', DATE_RANGES.map((r) => ({ value: r.value, label: r.label })))}
          {select('locationId', 'Location', (locations ?? []).map((l) => ({ value: l.id, label: l.name })), 'All locations')}
          {select('wasteType', 'Waste type', plain(WASTE_TYPES), 'All waste types')}
          {select('classification', 'Classification', plain(WASTE_CLASSIFICATIONS), 'All classifications')}
          {select('priority', 'Priority', plain(PRIORITIES), 'All priorities')}
        </div>
        <button type="button" onClick={onReset} disabled={!canReset} className={`shrink-0 ${buttonClass('ghost', 'sm')}`}>
          <Icon name="refresh" className="size-4" />
          Reset
          <span className="sr-only"> filters</span>
        </button>
      </div>
    </section>
  )
}

function AnalyticsResults({
  requests,
  now,
  filters,
  onReset,
}: {
  requests: AnalyticsRequest[]
  now: Date
  filters: AnalyticsFilters
  onReset: () => void
}) {
  // Recalculated on each render, which is cheap at this data size.
  const view = (() => {
    const filtered = filterAnalyticsRequests(requests, filters, now)
    return {
      filtered,
      kpis: calculateKpis(filtered),
      trend: buildTrend(filtered, filters.range, now),
      wasteTypes: summariseByWasteType(filtered),
      classification: summariseByClassification(filtered),
      priorities: summariseByPriority(filtered),
      locations: summariseByLocation(filtered),
      collections: summariseCollections(filtered),
      completionTime: averageCompletionTime(filtered),
      insights: generateInsights(filtered),
    }
  })()

  const rangeLabel = DATE_RANGES.find((r) => r.value === filters.range)?.label ?? ''

  if (view.filtered.length === 0) {
    return (
      <StateMessage kind="empty" title="No data matches the selected filters.">
        <button type="button" onClick={onReset} className={textLinkClass}>
          Reset filters
        </button>
      </StateMessage>
    )
  }

  const { kpis, collections } = view
  const share = (count: number) => `${formatPercent((count / kpis.totalRequests) * 100)} of requests`
  return (
    <div className="space-y-6">
      <p aria-live="polite" className="-mt-2 text-sm text-muted">
        Showing {kpis.totalRequests} of {requests.length} requests · {rangeLabel}
      </p>

      <section aria-label="Key figures">
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Total waste requests" value={kpis.totalRequests} context={rangeLabel} icon="list" tone="brand" />
          <KpiCard label="High priority requests" value={kpis.highPriority} context={share(kpis.highPriority)} icon="flag" tone="danger" />
          <KpiCard label="Recyclable requests" value={kpis.recyclable} context={share(kpis.recyclable)} icon="recycle" tone="brand" />
          <KpiCard label="Non-recyclable requests" value={kpis.nonRecyclable} context={share(kpis.nonRecyclable)} icon="trash" />
          <KpiCard label="Completed collections" value={kpis.completedCollections} context="For these requests" icon="truck" tone="brand" />
          <KpiCard label="Open requests" value={kpis.openRequests} context="Not completed or cancelled" icon="clock" />
        </dl>
      </section>

      <ChartCard
        title="Waste Reporting Trend"
        icon="analytics"
        description={
          view.trend.grouping === 'week'
            ? 'Requests reported per week (weeks start Monday; the first and last weeks may be partial).'
            : 'Requests reported per day.'
        }
        data={view.trend.points.map((p) => ({ label: p.label, value: `${p.count} requests` }))}
      >
        <TrendChart series={view.trend} />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Waste by Type"
          icon="trash"
          description="Requests per waste type, most common first."
          data={view.wasteTypes.map((t) => ({ label: t.wasteType, value: `${t.count} (${formatPercent(t.percent)})` }))}
        >
          <HorizontalBars rows={view.wasteTypes.map((t) => ({ name: t.wasteType, count: t.count, valueLabel: String(t.count) }))} />
        </ChartCard>

        <ChartCard
          title="Waste Classification"
          icon="recycle"
          description="Share of requests that are recyclable."
          data={view.classification.map((c) => ({ label: c.classification, value: `${c.count} (${formatPercent(c.percent)})` }))}
        >
          <ClassificationDonut summary={view.classification} />
        </ChartCard>

        <ChartCard
          title="Waste Requests by Location"
          icon="location"
          description="Requests per hotel location, busiest first."
          data={view.locations.map((l) => ({ label: l.name, value: `${l.total} requests` }))}
        >
          <HorizontalBars
            color={chartColors.brandLight}
            rows={view.locations.map((l) => ({ name: l.name, count: l.total, valueLabel: String(l.total) }))}
          />
        </ChartCard>

        <ChartCard
          title="Priority Distribution"
          icon="flag"
          description="Requests by priority, with share of the total."
          data={view.priorities.map((p) => ({ label: p.priority, value: `${p.count} (${formatPercent(p.percent)})` }))}
        >
          <HorizontalBars
            rows={view.priorities.map((p) => ({
              name: p.priority,
              count: p.count,
              valueLabel: `${p.count} (${formatPercent(p.percent)})`,
              color: priorityColors[p.priority],
            }))}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Collection Status"
        icon="truck"
        description="Collections for the filtered requests. Requests not yet assigned have no collection."
        data={[
          ...collections.byStatus.map((s) => ({ label: s.status, value: `${s.count} collections` })),
          {
            label: 'Collection completion rate',
            value: collections.completionRate === null ? 'Not available' : formatPercent(collections.completionRate),
          },
        ]}
      >
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {collections.total > 0 ? (
            <HorizontalBars
              color={chartColors.info}
              rows={collections.byStatus.map((s) => ({ name: s.status, count: s.count, valueLabel: String(s.count) }))}
            />
          ) : (
            <p className="text-muted">None of these requests have a collection yet.</p>
          )}
          <dl className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-lg bg-canvas p-4 ring-1 ring-line">
              <dt className="text-sm font-medium text-muted">Collection completion rate</dt>
              <dd className="mt-1 font-display text-3xl font-bold">
                {collections.completionRate === null ? '—' : formatPercent(collections.completionRate)}
              </dd>
              <dd className="text-xs text-muted">
                {collections.completionRate === null
                  ? 'No collections for these requests'
                  : `${collections.completed} of ${collections.total} collections completed`}
              </dd>
            </div>
            <div className="rounded-lg bg-canvas p-4 ring-1 ring-line">
              <dt className="text-sm font-medium text-muted">Average time to complete</dt>
              <dd className="mt-1 font-display text-3xl font-bold">
                {view.completionTime ? formatDuration(view.completionTime.averageHours) : '—'}
              </dd>
              <dd className="text-xs text-muted">
                {view.completionTime
                  ? `From report to completion, ${view.completionTime.requestCount} completed request${view.completionTime.requestCount === 1 ? '' : 's'}`
                  : 'No completed requests in this selection'}
              </dd>
            </div>
          </dl>
        </div>
      </ChartCard>

      <LocationSummaryTable rows={view.locations} />

      <section aria-labelledby="insights-heading" className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-warning-50 text-warning-700">
            <Icon name="lightbulb" className="size-[18px]" />
          </span>
          <div>
            <h2 id="insights-heading" className="text-base font-semibold sm:text-lg">
              Operational Insights
            </h2>
            <p className="mt-0.5 text-sm text-muted">Calculated from the filtered requests.</p>
          </div>
        </div>
        {view.insights.length > 0 ? (
          <ul className="mt-4 grid gap-x-8 gap-y-3 lg:grid-cols-2">
            {view.insights.map((insight) => (
              <li key={insight} className="flex gap-2.5 text-sm">
                <Icon name="check" className="mt-0.5 size-4 text-brand-600" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Not enough data to generate an operational insight.</p>
        )}
      </section>
    </div>
  )
}

/** Same layout as the loaded page, with no numbers, so nothing reads as a misleading zero. */
function LoadingSkeleton() {
  const block = 'animate-pulse rounded-xl border border-line bg-surface shadow-card'
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading analytics…</span>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${block} h-32 p-5`}>
            <div className="h-3 w-2/3 rounded bg-canvas" />
            <div className="mt-4 h-8 w-1/3 rounded bg-canvas" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className={`${block} h-80`} />
      <div aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`${block} h-72`} />
        ))}
      </div>
    </div>
  )
}
