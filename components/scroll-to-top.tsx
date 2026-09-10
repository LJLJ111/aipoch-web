'use client'

import { useEffect } from 'react'

/**
 * Scroll to the top when the page loads.
 * For detail pages and other pages that should initially be read from the top.
 */
export function ScrollToTop() {
  useEffect(() => {
    // Use requestAnimationFrame to scroll after rendering.
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
  }, [])

  return null
}
