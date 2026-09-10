'use client'

import { type RefObject, useEffect, useState } from 'react'
import {
  collectNavbarZones,
  initialNavbarTheme,
  type NavbarZone,
  type NavTheme,
  resolveNavbarTheme
} from './navbar-adaptive-logic'

export { isDark, NAVBAR_ZONE_SELECTORS, opaqueRgb } from './navbar-adaptive-logic'

export function alignNavbarPanels(header: HTMLElement) {
  const panels = header.querySelectorAll<HTMLElement>('[data-desktop-nav-panel]')

  panels.forEach((panel) => {
    const anchor = panel.parentElement?.getBoundingClientRect()
    if (!anchor) return

    const panelWidth = panel.getBoundingClientRect().width
    const maxLeft = Math.max(12, window.innerWidth - panelWidth - 12)
    const left = Math.min(Math.max(anchor.left, 12), maxLeft)

    panel.style.left = `${Math.round(left)}px`
  })
}

export function useAdaptiveNavbar(
  headerRef: RefObject<HTMLElement | null>,
  options?: { alignPanels?: boolean; pathname?: string }
) {
  const pathname = options?.pathname ?? '/'
  const [theme, setTheme] = useState<NavTheme>(() => initialNavbarTheme(pathname))
  const [scrolled, setScrolled] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: route changes require rescanning rendered navbar zones.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const root = document.documentElement
    let zones: NavbarZone[] = []
    let ticking = false

    const scan = () => {
      zones = collectNavbarZones(document, header)
    }

    const measure = () => {
      const height = header.offsetHeight
      if (!height) return
      const next = `${height}px`
      const current = getComputedStyle(root).getPropertyValue('--nav-h').trim()
      if (current !== next) {
        root.style.setProperty('--nav-h', next)
      }
    }

    const update = () => {
      ticking = false

      const probe = (header.offsetHeight || 80) * 0.6
      const nextTheme = resolveNavbarTheme(zones, probe)
      const nextScrolled = (window.pageYOffset || root.scrollTop) > 4
      setTheme((current) => (current === nextTheme ? current : nextTheme))
      setScrolled((current) => (current === nextScrolled ? current : nextScrolled))
    }

    const request = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    const refresh = () => {
      scan()
      measure()
      if (options?.alignPanels !== false) alignNavbarPanels(header)
      update()
    }

    refresh()

    const onScroll = () => request()
    const onResize = () => {
      scan()
      measure()
      if (options?.alignPanels !== false) alignNavbarPanels(header)
      request()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('load', refresh)

    const resizeObserver = new ResizeObserver(() => {
      measure()
      request()
    })
    resizeObserver.observe(header)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', refresh)
      resizeObserver.disconnect()
    }
  }, [headerRef, options?.alignPanels, pathname])

  return { theme, scrolled }
}
