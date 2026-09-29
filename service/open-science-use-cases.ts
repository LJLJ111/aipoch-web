import { cache } from 'react'
import { INTERNAL_API_URL } from '@/lib/config'
import type { UseCaseIndexEntry, UseCaseSession } from '@/lib/use-case-types'
import type { API } from '@/service/types'

const SUCCESS_CODE = 20000

/**
 * Contract for the Open-Science use-case showcase. Server components call the
 * fetchers below; the client "load full version" flow calls
 * useCaseFullTranscriptPath through apiClient (which awaits the mock worker).
 * MSW serves these routes from the generated files under public/use-cases/
 * until the real backend lands.
 */
export const useCaseListPath = '/v1/open-science/use-cases'
export const useCaseTranscriptPath = (slug: string) =>
  `/v1/open-science/use-cases/${encodeURIComponent(slug)}/transcript`
export const useCaseFullTranscriptPath = (slug: string) => `${useCaseTranscriptPath(slug)}/full`

// React cache() dedupes the generateMetadata + page fetches within a request.
const request = cache(async <T>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(`${INTERNAL_API_URL}${path}`, { cache: 'no-store' })
    if (!response.ok) return null
    const body = (await response.json()) as API.GeneralResponse<T>
    return body.code === SUCCESS_CODE ? body.data : null
  } catch {
    return null
  }
})

export const fetchUseCaseList = (): Promise<UseCaseIndexEntry[] | null> => request(useCaseListPath)

export const fetchUseCaseTranscript = (slug: string): Promise<UseCaseSession | null> =>
  request(useCaseTranscriptPath(slug))

export const fetchUseCaseFullTranscript = (slug: string): Promise<UseCaseSession | null> =>
  request(useCaseFullTranscriptPath(slug))
