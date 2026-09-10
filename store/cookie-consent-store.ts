'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { COOKIE_POLICY_VERSION } from '@/lib/config'

/**
 * Storage key for cookie consent preferences.
 *
 * This is a stable localStorage contract, not an environment setting. Environment-specific keys
 * would make saved privacy choices unavailable to other deployments or subsequent pages.
 */
export const COOKIE_PREFERENCES_STORAGE_KEY = 'aipoch_cookie_preferences'

export type CookieConsentPreferences = {
  policyVersion: typeof COOKIE_POLICY_VERSION
  necessary: true
  analytics: boolean
  embeddedMedia: boolean
  hasStoredChoice: boolean
}

type CookieConsentActions = {
  hasHydrated: boolean
  setPreferences: (preferences: {
    analytics: boolean
    embeddedMedia: boolean
  }) => void
  acceptAll: () => void
  rejectNonEssential: () => void
  resetToDefaults: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export type CookieConsentState = CookieConsentPreferences & CookieConsentActions

const defaultPreferences: CookieConsentPreferences = {
  policyVersion: COOKIE_POLICY_VERSION,
  necessary: true,
  analytics: false,
  embeddedMedia: false,
  hasStoredChoice: false
}

// Fall back to in-memory defaults when localStorage is unavailable so privacy controls work in private or restricted environments.
const resetStoredPreferences = () => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(COOKIE_PREFERENCES_STORAGE_KEY)
  } catch {
    // A storage failure does not affect the current page; default preferences remain the fallback.
  }
}

// Discard saved choices when the policy version changes so users must consent to the updated categories.
const isStoredPolicyCurrent = (rawValue: string) => {
  try {
    const parsed = JSON.parse(rawValue) as { state?: { policyVersion?: string } }
    return parsed.state?.policyVersion === COOKIE_POLICY_VERSION
  } catch {
    return false
  }
}

const cookieConsentStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null

    try {
      const rawValue = window.localStorage.getItem(name)

      if (!rawValue) return null

      if (!isStoredPolicyCurrent(rawValue)) {
        window.localStorage.removeItem(name)
        return null
      }

      return rawValue
    } catch {
      resetStoredPreferences()
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      // Keep Zustand's in-memory state if writing fails so choices just saved remain effective on the current page.
    }
  },
  removeItem: (name: string) => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      // Ignore cleanup failures; the in-memory defaults still constrain subsequent script loading.
    }
  }
}

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      hasHydrated: false,
      setPreferences: (preferences) => {
        set({
          ...defaultPreferences,
          ...preferences,
          hasStoredChoice: true
        })
      },
      acceptAll: () => {
        set({
          ...defaultPreferences,
          analytics: true,
          embeddedMedia: true,
          hasStoredChoice: true
        })
      },
      rejectNonEssential: () => {
        set({
          ...defaultPreferences,
          hasStoredChoice: true
        })
      },
      resetToDefaults: () => {
        resetStoredPreferences()
        set({
          ...defaultPreferences,
          hasHydrated: true
        })
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated })
    }),
    {
      name: COOKIE_PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => cookieConsentStorage),
      // Persist only user choices and the policy version; recreate hydration flags and actions on every page load.
      partialize: (state) => ({
        policyVersion: state.policyVersion,
        necessary: state.necessary,
        analytics: state.analytics,
        embeddedMedia: state.embeddedMedia,
        hasStoredChoice: state.hasStoredChoice
      }),
      onRehydrateStorage: (state) => (_storedState, error) => {
        // Show the banner and load scripts only after rehydration so transient SSR defaults cannot trigger third-party scripts.
        if (error) {
          state?.resetToDefaults()
          return
        }

        state?.setHasHydrated(true)
      }
    }
  )
)
