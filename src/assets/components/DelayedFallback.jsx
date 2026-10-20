import { useState, useEffect } from 'react'

/**
 * DelayedFallback prevents brief flickering of loading spinners
 * on fast networks / low latency connections.
 *
 * It delays rendering its children (the fallback spinner) for `delay` ms (default: 300ms).
 * If the lazy-loaded component finishes loading within this window, the fallback is
 * never displayed, eliminating the distracting 1-frame flash.
 *
 * @param {Object} props
 * @param {number} [props.delay=300] - Delay in milliseconds before showing fallback.
 * @param {React.ReactNode} props.children - Fallback UI (e.g. Spinner / PageLoader).
 */
export default function DelayedFallback({ delay = 300, children }) {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!shouldShow) return null
  return children
}
