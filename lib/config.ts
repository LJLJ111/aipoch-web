import { env } from 'next-runtime-env'

/**
 * Runtime configuration.
 * Export environment variables here with UPPER_SNAKE_CASE names and default values.
 */
export const GOOGLE_ANALYTICS_ID = env('NEXT_PUBLIC_GA_ID') || ''

export const CLARITY_ID = env('NEXT_PUBLIC_CLARITY_ID') || ''

export const API_URL = env('NEXT_PUBLIC_API_URL') || '/api'

export const STATIC_ASSETS_ORIGIN =
  env('NEXT_PUBLIC_STATIC_ASSETS_ORIGIN') || 'https://statics.aipoch.com'

export const OPENSCIENCE_WIKI_URL_PREFIX = env('NEXT_PUBLIC_OPENSCIENCE_WIKI_URL_PREFIX')

export const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api'

export const OPENSCIENCE_WIKI_INTERNAL_URL_PREFIX =
  process.env.OPENSCIENCE_WIKI_INTERNAL_URL_PREFIX || ''

const CANONICAL_SITE_DOMAIN = 'https://aipoch.com'

const normalizeSiteDomain = (value: string | undefined): string => {
  const configured = value?.trim() || CANONICAL_SITE_DOMAIN

  try {
    const url = new URL(configured)
    // Production used both hosts historically; all generated metadata now resolves to non-www.
    if (url.hostname.toLowerCase() === 'www.aipoch.com') url.hostname = 'aipoch.com'
    return url.origin
  } catch {
    return CANONICAL_SITE_DOMAIN
  }
}

export const SITE_DOMAIN = normalizeSiteDomain(process.env.SITE_DOMAIN)

export const AIPOCH_DESIGN_SYSTEM_URL = SITE_DOMAIN.includes('aipoch.com')
  ? 'https://design-system.aipoch.com/'
  : 'https://design-system.aipoch.xyz/'

/** Medical Research Skills repository shared across the application. */
export const AIPOCH_GITHUB_URL = 'https://github.com/aipoch/medical-research-skills'

/**
 * Cookie policy version.
 *
 * Manually increment this version when cookie categories, purposes, third-party services, or policy text change the meaning of consent.
 * Discard outdated preferences so users must confirm their choices under the updated policy.
 */
export const COOKIE_POLICY_VERSION = 'v2'
export const SUPPORT_EMAIL = 'support@aipoch.com'
