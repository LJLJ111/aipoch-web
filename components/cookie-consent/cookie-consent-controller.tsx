'use client'

import { useEffect } from 'react'
import { CLARITY_ID, GOOGLE_ANALYTICS_ID } from '@/lib/config'
import { useCookieConsentStore } from '@/store/cookie-consent-store'
import { clearCurrentDomainAnalyticsCookies } from './cookie-utils'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: {
      (...args: unknown[]): void
      q?: unknown[]
    }
  }
}

const GA_SCRIPT_ID = 'aipoch-ga-script'
const CLARITY_SCRIPT_ID = 'aipoch-clarity-script'
// GA config is not idempotent; reset the flag after rejection so a later grant can configure it again.
let hasConfiguredGoogleAnalytics = false
let hasLoadedClarityRuntime = false

const removeScript = (id: string) => {
  document.getElementById(id)?.remove()
}

const setGoogleAnalyticsDisabled = (disabled: boolean) => {
  if (!GOOGLE_ANALYTICS_ID) return

  const typedWindow = window as unknown as Record<string, boolean>
  typedWindow[`ga-disable-${GOOGLE_ANALYTICS_ID}`] = disabled
}

const ensureGtag = () => {
  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag() {
      // The standard Google gtag snippet queues arguments objects, which the runtime expects when processing commands.
      // biome-ignore lint/complexity/noArguments: gtag.js expects the standard snippet's arguments object, not a rest-parameter array.
      window.dataLayer?.push(arguments)
    }
}

const updateGoogleConsent = (analytics: boolean) => {
  ensureGtag()
  // Google Consent Mode enables analytics only with consent; advertising and personalization storage remain denied.
  window.gtag?.('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted'
  })
}

const sendGoogleAnalyticsPageView = () => {
  if (!GOOGLE_ANALYTICS_ID) return

  const pagePath = `${window.location.pathname}${window.location.search}`

  // Send the first page_view only after consent. Use config solely for initialization to avoid missing or duplicating events during dynamic loading.
  window.gtag?.('event', 'page_view', {
    send_to: GOOGLE_ANALYTICS_ID,
    page_title: document.title,
    page_location: window.location.href,
    page_path: pagePath
  })
}

const ensureGoogleAnalytics = () => {
  if (!GOOGLE_ANALYTICS_ID) return

  // Clear ga-disable and create the script only after analytics consent to prevent requests while consent is denied.
  ensureGtag()
  setGoogleAnalyticsDisabled(false)

  if (!document.getElementById(GA_SCRIPT_ID)) {
    const script = document.createElement('script')
    script.id = GA_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      GOOGLE_ANALYTICS_ID
    )}`
    document.head.appendChild(script)
  }

  if (!hasConfiguredGoogleAnalytics) {
    window.gtag?.('js', new Date())
    window.gtag?.('config', GOOGLE_ANALYTICS_ID, {
      anonymize_ip: true,
      send_page_view: false
    })
    sendGoogleAnalyticsPageView()
    hasConfiguredGoogleAnalytics = true
  }
}

const disableGoogleAnalytics = () => {
  setGoogleAnalyticsDisabled(true)
  removeScript(GA_SCRIPT_ID)
  hasConfiguredGoogleAnalytics = false
}

const passClarityConsent = (enabled: boolean) => {
  // Clarity consent v2 grants analytics storage only with analytics consent; advertising storage remains denied.
  window.clarity?.('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: enabled ? 'granted' : 'denied'
  })
}

const setClarityRuntimeConsent = (hasConsent: boolean) => {
  // Clarity consent v1 controls ongoing runtime tracking and must be explicitly disabled when consent is withdrawn.
  window.clarity?.('consent', hasConsent)
}

const ensureClarity = () => {
  if (!CLARITY_ID) return

  // Create the queue before the Clarity script loads asynchronously so consentv2 commands are retained.
  window.clarity =
    window.clarity ||
    ((...args: unknown[]) => {
      const clarityQueue = window.clarity?.q || []
      clarityQueue.push(args)

      if (window.clarity) {
        window.clarity.q = clarityQueue
      }
    })

  if (!document.getElementById(CLARITY_SCRIPT_ID)) {
    const script = document.createElement('script')
    script.id = CLARITY_SCRIPT_ID
    script.async = true
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`
    document.head.appendChild(script)
  }

  setClarityRuntimeConsent(true)
  passClarityConsent(true)
  hasLoadedClarityRuntime = true
}

const disableClarity = () => {
  const shouldReloadAfterShutdown = hasLoadedClarityRuntime

  setClarityRuntimeConsent(false)
  passClarityConsent(false)
  removeScript(CLARITY_SCRIPT_ID)
  hasLoadedClarityRuntime = false

  if (shouldReloadAfterShutdown) {
    // Clarity has no reliable hot-unload API; reload to fully remove its runtime, event listeners, and timers.
    window.location.reload()
  }
}

export function CookieConsentController() {
  const analytics = useCookieConsentStore((state) => state.analytics)
  const hasHydrated = useCookieConsentStore((state) => state.hasHydrated)

  useEffect(() => {
    // Deny all non-essential storage initially, then apply saved preferences after Zustand rehydrates.
    ensureGtag()
    window.gtag?.('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted'
    })
  }, [])

  useEffect(() => {
    // Keep the default denied state before hydration to avoid loading third-party scripts during the SSR/client transition.
    if (!hasHydrated) return

    updateGoogleConsent(analytics)

    if (analytics) {
      // Analytics is the master switch for GA and Clarity; cookie choices never enable advertising or personalization consent.
      ensureGoogleAnalytics()
      ensureClarity()
      return
    }

    // When analytics consent is withdrawn, remove scripts and clear known analytics cookies on the current domain to reduce residual tracking.
    disableGoogleAnalytics()
    disableClarity()
    clearCurrentDomainAnalyticsCookies()
  }, [analytics, hasHydrated])

  return null
}
