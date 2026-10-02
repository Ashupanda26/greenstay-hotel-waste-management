import { useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: T }

/**
 * Runs a loader when the page opens and tracks loading / error / success.
 * `load` must be stable (a module function or wrapped in useCallback), because
 * a new function means "load again". `retry()` loads again, e.g. after an update.
 */
export function useAsyncData<T>(load: () => Promise<T>): AsyncState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  // Each result remembers which load produced it, so a stale result is never shown.
  const [result, setResult] = useState<{ load: () => Promise<T>; attempt: number; state: AsyncState<T> } | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => !cancelled && setResult({ load, attempt, state: { status: 'success', data } }),
      () => !cancelled && setResult({ load, attempt, state: { status: 'error' } }),
    )
    return () => {
      cancelled = true
    }
  }, [load, attempt])

  const isCurrent = result !== null && result.load === load && result.attempt === attempt
  // While reloading the same data (retry after a change), keep showing what's already on screen.
  const isRefreshing = result !== null && result.load === load && result.state.status === 'success'
  const state: AsyncState<T> = isCurrent || isRefreshing ? result.state : { status: 'loading' }
  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
