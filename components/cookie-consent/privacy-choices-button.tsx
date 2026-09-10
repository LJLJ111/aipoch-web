'use client'

import { openCookiePreferences } from './cookie-consent-events'

export function PrivacyChoicesButton() {
  return (
    <button
      type="button"
      className="text-[10px] text-white/50 underline underline-offset-4 transition-colors hover:text-white"
      onClick={openCookiePreferences}
    >
      Manage Cookies
    </button>
  )
}
