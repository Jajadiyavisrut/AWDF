import { lazy } from 'react'

/**
 * lazyWithMinDelay wraps dynamic import() to enforce a minimum delay.
 * Useful for lab demonstrations and testing loading states under fast local connections.
 *
 * @param {Function} importFactory - Function returning dynamic import, e.g. () => import('./Component')
 * @param {number} [minDelay=300] - Minimum delay in milliseconds.
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithMinDelay(importFactory, minDelay = 300) {
  return lazy(() =>
    Promise.all([
      importFactory(),
      new Promise((resolve) => setTimeout(resolve, minDelay)),
    ]).then(([moduleExports]) => moduleExports)
  )
}
