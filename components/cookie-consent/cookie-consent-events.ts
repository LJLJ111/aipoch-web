'use client'

export const OPEN_COOKIE_PREFERENCES_EVENT = 'aipoch:open-cookie-preferences'

export const openCookiePreferences = () => {
  if (typeof window === 'undefined') return

  // Share dialog state between the footer and banner without requiring callers to know where the dialog is mounted.
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))
}
