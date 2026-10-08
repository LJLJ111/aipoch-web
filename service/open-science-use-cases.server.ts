import 'server-only'
import { after } from 'next/server'
import { cache } from 'react'
import { INTERNAL_API_URL } from '@/lib/config'
import { createUseCaseManifestCache } from '@/lib/use-case-manifest'
import type { UseCaseDetail, UseCaseIndexEntry } from '@/lib/use-case-types'
import { listUseCasesFromDisk } from '@/lib/use-cases'
import {
  fetchUseCaseDetail as fetchApiDetail,
  fetchUseCaseList as fetchApiList
} from './open-science-use-cases'

// TODO: Set the approved public S3 manifest URL when the publishing location is known.
// Resource paths resolve relative to this file's directory. Never put credentials here.
const USE_CASE_MANIFEST_URL: string | null = null

const manifestSource = (): string | null => {
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
let loggedPlaceholder = false

// React cache pins a single snapshot across metadata, details, and related cards
// within one render. The underlying manifest cache survives subsequent requests.
const readManifest = cache(async () => {
  const source = manifestSource()
  if (!source) return null
  if (runtime.__aipochUseCaseManifest?.url !== source) {
    runtime.__aipochUseCaseManifest = {
      url: source,
      reader: createUseCaseManifestCache(source)
    }
  }
  return runtime.__aipochUseCaseManifest.reader.read((task) => after(task))
})

export const fetchUseCaseList = async (): Promise<UseCaseIndexEntry[] | null> => {
  if (!manifestSource()) {
    if (!loggedPlaceholder) {
      // biome-ignore lint/suspicious/noConsole: Make the intentionally unset S3 source visible.
      console.info('[use-case-manifest]', 'source.unconfigured', { source: 'existing-api' })
      loggedPlaceholder = true
    }
    return fetchApiList()
  }
  try {
    return await readManifest()
  } catch {
    // A configured source failure is not an empty catalog or a live API fallback.
    return null
  }
}

export const fetchUseCaseDetail = async (slug: string): Promise<UseCaseDetail | null> => {
  if (!manifestSource()) return fetchApiDetail(slug)
  const entries = await readManifest()
  const entry = entries?.find((item) => item.slug === slug)
  if (!entry) return null
  return {
    slug: entry.slug,
    title: entry.title,
    coverImage: entry.preview?.image,
    hasReplay: false,
    package: entry.package,
    introductionUrl: entry.introductionUrl
  }
}

export const fetchUseCaseSitemapEntries = async (): Promise<UseCaseIndexEntry[]> =>
  manifestSource() ? ((await fetchUseCaseList()) ?? []) : listUseCasesFromDisk()
