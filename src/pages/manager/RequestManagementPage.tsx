import { useSearchParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import PageHeader from '../../components/ui/PageHeader'
import RequestList from '../../components/ui/RequestList'
import StateMessage from '../../components/ui/StateMessage'
import { buttonClass, inputClass, textLinkClass } from '../../components/ui/styles'
import { filterOptions, filterRequests, hasActiveFilters, readFilters } from '../../lib/requestFilters'
import { listManagerRequests } from '../../lib/queries/wasteRequests'
import { useAsyncData } from '../../lib/useAsyncData'
import { paths } from '../../routes/paths'

export default function RequestManagementPage() {
  const requests = useAsyncData(listManagerRequests)
  // Filters live in the URL, so they survive opening a request and coming back.
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const active = hasActiveFilters(filters)

  const setParam = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  const resetFilters = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <>
      <PageHeader
        eyebrow="Waste Manager"
        title="Requests"
        description="Every waste request from every location. Open one to assign, schedule and complete its collection."
      />

      <section aria-label="Search and filters" className="mb-5 rounded-xl border border-line bg-surface p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="search" className="sr-only">
              Search by reference or location
            </label>
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                id="search"
                type="search"
                value={filters.search}
                onChange={(event) => setParam('q', event.target.value)}
                placeholder="Search reference or location"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          {filterOptions.map((option) => (
            <div key={option.key}>
              <label htmlFor={`filter-${option.key}`} className="sr-only">
                {option.label}
              </label>
              <select
                id={`filter-${option.key}`}
                value={filters[option.key]}
                onChange={(event) => setParam(option.key, event.target.value)}
                className={`${inputClass} ${filters[option.key] ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700' : ''}`}
              >
                <option value="">{`${option.label}: All`}</option>
                {option.values.map((value) => (
                  <option key={value} value={value}>
                    {`${option.label}: ${value}`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <p aria-live="polite" className="text-sm text-muted">
            {requests.status === 'success'
              ? `Showing ${filterRequests(requests.data, filters).length} of ${requests.data.length} requests`
              : 'Loading requests…'}
          </p>
          <button type="button" onClick={resetFilters} disabled={!active} className={buttonClass('ghost', 'sm')}>
            <Icon name="refresh" className="size-4" />
            Reset filters
          </button>
        </div>
      </section>

      {requests.status === 'loading' && <StateMessage kind="loading" title="Loading requests…" />}

      {requests.status === 'error' && (
        <StateMessage kind="error" title="We couldn't load requests.">
          Check your connection and{' '}
          <button type="button" onClick={requests.retry} className={textLinkClass}>
            try again
          </button>
          .
        </StateMessage>
      )}

      {requests.status === 'success' &&
        (() => {
          const shown = filterRequests(requests.data, filters)
          if (requests.data.length === 0) {
            return (
              <StateMessage kind="empty" title="No waste requests yet.">
                Requests appear here as soon as staff report waste.
              </StateMessage>
            )
          }
          if (shown.length === 0) {
            return (
              <StateMessage kind="empty" title="No requests match your search or filters.">
                Try a different search, or{' '}
                <button type="button" onClick={resetFilters} className={textLinkClass}>
                  reset the filters
                </button>
                .
              </StateMessage>
            )
          }
          return (
            <RequestList
              requests={shown}
              linkTo={paths.manager.requestDetails}
              caption="Waste requests, newest first"
              showReporter
            />
          )
        })()}
    </>
  )
}
