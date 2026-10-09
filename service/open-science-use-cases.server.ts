import 'server-only'
import { after } from 'next/server'
import { cache } from 'react'
import { INTERNAL_API_URL } from '@/lib/config'
import { createUseCaseManifestCache } from '@/lib/use-case-manifest'
import type { UseCaseDetail, UseCaseIndexEntry } from '@/lib/use-case-types'

// Public publishing location; no credentials are needed by the server or browser.
const USE_CASE_MANIFEST_URL = 'https://statics.aipoch.com/open-science/usecases/manifest.json'

const manifestSource = (): string => {
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    return `${new URL(INTERNAL_API_URL).origin}/use-case-manifest/manifest.json`
  }
  return USE_CASE_MANIFEST_URL
}

// Next can load this module in separate route bundles within the same runtime.
const runtime = globalThis as typeof globalThis & {
  __aipochUseCaseManifest?: {
    url: string
    reader: ReturnType<typeof createUseCaseManifestCache>
  }
}

// React cache pins a single snapshot across metadata, details, and related cards
// within one render. The underlying manifest cache survives subsequent requests.
const readManifest = cache(async () => {
  const source = manifestSource()
  if (runtime.__aipochUseCaseManifest?.url !== source) {
    runtime.__aipochUseCaseManifest = {
      url: source,
      reader: createUseCaseManifestCache(source)
    }
  }
  return runtime.__aipochUseCaseManifest.reader.read((task) => after(task))
})

export const fetchUseCaseList = async (): Promise<UseCaseIndexEntry[] | null> => {
  try {
    return await readManifest()
  } catch {
    // A configured source failure is not an empty catalog or a live API fallback.
    return null
  }
}

export const fetchUseCaseDetail = async (slug: string): Promise<UseCaseDetail | null> => {
  const entries = await readManifest()
  const entry = entries?.find((item) => item.slug === slug)
  if (!entry) return null
  return {
    slug: entry.slug,
    title: entry.title,
    coverImage: entry.preview?.image,
    package: entry.package,
    introductionUrl: entry.introductionUrl
  }
}

export const fetchUseCaseSitemapEntries = async (): Promise<UseCaseIndexEntry[]> =>
  (await fetchUseCaseList()) ?? []
