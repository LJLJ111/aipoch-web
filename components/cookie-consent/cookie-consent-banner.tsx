'use client'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useCookieConsentStore } from '@/store/cookie-consent-store'
import { OPEN_COOKIE_PREFERENCES_EVENT } from './cookie-consent-events'

type DraftPreferences = {
  analytics: boolean
  embeddedMedia: boolean
}

const defaultDraft: DraftPreferences = {
  analytics: false,
  embeddedMedia: false
}

const actionButtonClass =
  'min-h-10 rounded-none border border-black px-4 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-[#facc15] hover:text-black'

const primaryButtonClass = `${actionButtonClass} bg-black text-white`
const secondaryButtonClass = `${actionButtonClass} bg-white text-black`

const PreferenceRow = ({
  id,
  title,
  description,
  checked,
  disabled = false,
  onChange
}: {
  id: string
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}) => {
  const descriptionId = `${id}-description`

  return (
    <div className="grid gap-4 border-b border-black/10 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <h3 id={id} className="text-base font-semibold text-black">
          {title}
        </h3>
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-black/60">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className="relative inline-flex h-7 w-12 shrink-0 items-center border border-black/20 bg-black/10 transition-colors aria-checked:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className={`absolute left-1 size-5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function CookieConsentBanner() {
  const analytics = useCookieConsentStore((state) => state.analytics)
  const embeddedMedia = useCookieConsentStore((state) => state.embeddedMedia)
  const hasStoredChoice = useCookieConsentStore((state) => state.hasStoredChoice)
  const hasHydrated = useCookieConsentStore((state) => state.hasHydrated)
  const acceptAll = useCookieConsentStore((state) => state.acceptAll)
  const rejectNonEssential = useCookieConsentStore((state) => state.rejectNonEssential)
  const setPreferences = useCookieConsentStore((state) => state.setPreferences)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [draft, setDraft] = useState<DraftPreferences>(defaultDraft)

  // Wait for persisted state to hydrate before showing the banner to avoid flicker or duplicate prompts from SSR defaults.
  const showBanner = hasHydrated && !hasStoredChoice

  const openPreferences = useCallback(() => {
    // Use draft dialog state so closing it or visiting the policy page does not overwrite saved preferences.
    setDraft({ analytics, embeddedMedia })
    setIsPreferencesOpen(true)
  }, [analytics, embeddedMedia])

  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])

  const saveDraft = () => {
    setPreferences(draft)
    closePreferences()
  }

  const rejectAll = () => {
    rejectNonEssential()
    setDraft(defaultDraft)
    closePreferences()
  }

  const acceptAllAndClose = () => {
    acceptAll()
    setDraft({ analytics: true, embeddedMedia: true })
    closePreferences()
  }

  useEffect(() => {
    // The footer privacy action opens this same dialog through a global event, avoiding duplicate layout state.
    const handleOpenPreferences = () => openPreferences()

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences)
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences)
  }, [openPreferences])

  return (
    <>
      {showBanner && (
        <section
          aria-label="Cookie choices"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-5xl rounded-none border border-black bg-white p-5 shadow-[6px_6px_0_rgba(0,0,0,0.92)]"
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-black">Cookie choices</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/65">
                We use necessary cookies and similar technologies required for the operation and
                security of our website. Optional cookies for functional and embedded media and
                analytics are used only with your consent and can be managed through "MANAGE
                CHOICES".{' '}
                <Link href="/cookie-policy" className="underline underline-offset-4">
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button type="button" className={primaryButtonClass} onClick={rejectAll}>
                Reject non-essential
              </button>
              <button type="button" className={secondaryButtonClass} onClick={openPreferences}>
                Manage choices
              </button>
              <button type="button" className={primaryButtonClass} onClick={acceptAllAndClose}>
                Accept all
              </button>
            </div>
          </div>
        </section>
      )}

      <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
        <DialogContent
          className="max-h-[calc(100vh-2rem)] w-full max-w-2xl gap-0 overflow-auto rounded-none border border-black bg-white p-0 shadow-[8px_8px_0_rgba(0,0,0,0.95)] sm:max-w-2xl"
          showCloseButton={false}
        >
          <div className="border-b border-black/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-bold text-black">
                  Cookie Preferences
                </DialogTitle>
                <DialogDescription className="mt-3 text-sm leading-6 text-black/65">
                  Websites use cookies and other identifiers to store and retrieve information on
                  your device. Some of this information may be shared with third parties for
                  different purposes. You can manage your preferences below and update them at any
                  time. For more information, please see our{' '}
                  <Link
                    href="/cookie-policy"
                    className="underline underline-offset-4"
                    onClick={closePreferences}
                  >
                    Cookie Policy
                  </Link>
                  .
                </DialogDescription>
              </div>
              <button
                type="button"
                aria-label="Close cookie preferences"
                className="size-9 shrink-0 rounded-none border border-black/20 text-lg font-bold text-black hover:bg-black hover:text-white"
                onClick={closePreferences}
              >
                ×
              </button>
            </div>
          </div>

          <form className="px-6" onSubmit={(event) => event.preventDefault()}>
            <PreferenceRow
              id="cookie-necessary"
              title="Necessary"
              description="Necessary for authentication, security, fraud prevention, and core website functionality. These cannot be turned off here."
              checked
              disabled
            />
            <PreferenceRow
              id="cookie-functional-embedded-media"
              title="Functional and embedded media cookies"
              description="Support embedded media, user preferences, feature testing, and other functionalities."
              checked={draft.embeddedMedia}
              onChange={(checked) =>
                setDraft((current) => ({ ...current, embeddedMedia: checked }))
              }
            />
            <PreferenceRow
              id="cookie-analytics"
              title="Analytics cookies"
              description="Help us understand how our services perform, how users interact with them, and improve website performance."
              checked={draft.analytics}
              onChange={(checked) => setDraft((current) => ({ ...current, analytics: checked }))}
            />
          </form>

          <div className="flex flex-wrap justify-end gap-2 p-6">
            <button type="button" className={primaryButtonClass} onClick={rejectAll}>
              Reject non-essential
            </button>
            <button type="button" className={secondaryButtonClass} onClick={saveDraft}>
              Save choices
            </button>
            <button type="button" className={primaryButtonClass} onClick={acceptAllAndClose}>
              Accept all
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
