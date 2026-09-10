/**
 * Public homepage configuration: GET /v1/homepage/{module_name}.
 * Read & watch：GET /v1/homepage/{module_name}/read-watch
 */

import { INTERNAL_API_URL } from '@/lib/config'
import type { API } from '@/service/types'

const SUCCESS_CODE = 20000
/** A slow backend must not block homepage SSR indefinitely. */
const HOMEPAGE_FETCH_TIMEOUT_MS = 8_000
export const OPEN_SCIENCE_HOMEPAGE_MODULE = 'openscience' as const

export interface HomepageTitleTextItem {
  title: string
  text: string
}

export interface HomepageMediaItem {
  title: string
  url: string
}

/** GET /v1/homepage/{module_name} — data */
export interface HomepagePublicConfig {
  release_version: string
  latest_release_update: string
  latest_release_title: string
  latest_release_desc: string
  latest_release_features: HomepageTitleTextItem[]
  media: HomepageMediaItem[]
  what_it_does: HomepageTitleTextItem[]
}

export interface HomepageReadWatchItem {
  title: string
  category: string
  published_at: string
  slug: string
}

/** GET /v1/homepage/{module_name}/read-watch — data */
export interface HomepageReadWatchResponse {
  items: HomepageReadWatchItem[]
}

interface HomepageSkillsResponse {
  total_skills: number
}

function isHomepageE2EMockEnabled(): boolean {
  // Never serve fixtures in production even if the env var leaks.
  return process.env.E2E_HOMEPAGE_MOCK === '1' && process.env.NODE_ENV !== 'production'
}

async function fetchHomepageJson<T>(path: string): Promise<T | null> {
  // Playwright cannot intercept RSC server fetch; e2e sets this on the Next process.
  if (isHomepageE2EMockEnabled()) {
    const { resolveHomepageE2EFixture } = await import('../tests/e2e/homepage-e2e-fixtures')
    const fixture = resolveHomepageE2EFixture(path)
    return fixture == null ? null : (fixture as T)
  }

  try {
    const base = INTERNAL_API_URL.replace(/\/$/, '')
    const url = `${base}${path}`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(HOMEPAGE_FETCH_TIMEOUT_MS)
    })
    if (!res.ok) return null

    const json: API.GeneralResponse<T | null> = await res.json()
    if (json.code !== SUCCESS_CODE || !json.data) return null
    return json.data
  } catch (error) {
    console.error(`Error fetching homepage path ${path}:`, error)
    return null
  }
}

/** Fetch public configuration for the requested homepage module on the server; return null on failure. */
export async function fetchHomepageConfig(
  moduleName: string
): Promise<HomepagePublicConfig | null> {
  return fetchHomepageJson<HomepagePublicConfig>(`/v1/homepage/${encodeURIComponent(moduleName)}`)
}

/** Fetch Read & watch entries (the latest blog posts for the module tag) on the server; return null on failure. */
export async function fetchHomepageReadWatch(
  moduleName: string
): Promise<HomepageReadWatchResponse | null> {
  return fetchHomepageJson<HomepageReadWatchResponse>(
    `/v1/homepage/${encodeURIComponent(moduleName)}/read-watch`
  )
}

/** Fetch the current published skill count on the server; return null on failure or an invalid response. */
export async function fetchHomepageSkillsCount(): Promise<number | null> {
  const data = await fetchHomepageJson<HomepageSkillsResponse>('/v1/skills/total_count')
  const total = data?.total_skills
  return typeof total === 'number' && Number.isFinite(total) && total > 0 ? Math.floor(total) : null
}
