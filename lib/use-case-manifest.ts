import type { UseCaseManifestEntry, UseCaseManifestResource } from './use-case-types'

type ScheduleAfterResponse = (task: () => Promise<void>) => unknown
type Snapshot = { entries: UseCaseManifestEntry[]; etag: string | null }
const LOG_PREFIX = '[use-case-manifest]'

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected a manifest object')
  }
  return value as Record<string, unknown>
}

const resource = (value: unknown): UseCaseManifestResource => {
  const item = record(value)
  if (
    typeof item.file_name !== 'string' ||
    !item.file_name.trim() ||
    !Number.isSafeInteger(item.bytes) ||
    (item.bytes as number) < 0 ||
    typeof item.sha256 !== 'string' ||
    !/^[a-f\d]{64}$/i.test(item.sha256) ||
    typeof item.path !== 'string' ||
    !item.path ||
    item.path.includes('\\') ||
    Array.from(item.path).some((character) => character.charCodeAt(0) < 32) ||
    item.path.split('/').some((part) => !part || part === '.' || part === '..') ||
    /^[a-z][a-z\d+.-]*:/i.test(item.path)
  )
    throw new Error('Invalid manifest resource')
  return item as unknown as UseCaseManifestResource
}

const httpUrl = (value: string): URL => {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Expected an HTTP resource URL')
  }
  return url
}

/** Paths in the manifest are raw object keys, not pre-encoded URLs. */
export const parseUseCaseManifest = (
  value: unknown,
  manifestUrl: string
): UseCaseManifestEntry[] => {
  if (!Array.isArray(value)) throw new Error('Expected a manifest array')
  const base = new URL('.', httpUrl(manifestUrl))
  const names = new Set<string>()
  const resourceUrl = (item: UseCaseManifestResource) =>
    new URL(item.path.split('/').map(encodeURIComponent).join('/'), base).href
  return value.map((value) => {
    const item = record(value)
    if (
      typeof item.title !== 'string' ||
      !item.title.trim() ||
      typeof item.name !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name) ||
      names.has(item.name)
    )
      throw new Error('Invalid or duplicate manifest case')
    names.add(item.name)
    const cover = resource(item.cover)
    const archive = resource(item.case)
    const releaseUrl = record(item.case).release_url
    if (typeof releaseUrl !== 'string') throw new Error('Invalid release URL')
    return {
      slug: item.name,
      title: item.title,
      preview: { image: resourceUrl(cover) },
      hasReplay: false,
      package: {
        url: releaseUrl ? httpUrl(releaseUrl).href : resourceUrl(archive),
        filename: archive.file_name,
        sizeBytes: archive.bytes,
        sha256: archive.sha256
      },
      ...(item.introduction === undefined
        ? {}
        : {
            introductionUrl: resourceUrl(resource(item.introduction))
          })
    }
  })
}

/** One cache per manifest source in a server runtime; no TTL or eviction timer. */
export const createUseCaseManifestCache = (url: string) => {
  httpUrl(url)
  let snapshot: Snapshot | undefined
  let inFlight: Promise<Snapshot> | undefined
  let completedChecks = 0

  const download = async (): Promise<Snapshot> => {
    const startedAt = Date.now()
    let httpStatus: number | undefined
    const headers: Record<string, string> = snapshot?.etag ? { 'If-None-Match': snapshot.etag } : {}
    // biome-ignore lint/suspicious/noConsole: Manifest diagnostics are intentionally console-only.
    console.info(LOG_PREFIX, 'fetch.start', { conditional: Boolean(snapshot?.etag) })
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers,
        signal: AbortSignal.timeout(15_000)
      })
      httpStatus = response.status
      if (response.status === 304) {
        if (!snapshot?.etag) throw new Error('Unexpected 304 without a cached validator')
        // biome-ignore lint/suspicious/noConsole: Manifest diagnostics are intentionally console-only.
        console.info(LOG_PREFIX, 'fetch.not-modified', { durationMs: Date.now() - startedAt })
        return snapshot
      }
      if (response.status !== 200) throw new Error(`Manifest HTTP ${response.status}`)
      const entries = parseUseCaseManifest(await response.json(), url)
      // Publish only a fully validated snapshot with the validator from this GET.
      snapshot = { entries, etag: response.headers.get('etag') }
      // biome-ignore lint/suspicious/noConsole: Manifest diagnostics are intentionally console-only.
      console.info(LOG_PREFIX, 'fetch.updated', {
        count: entries.length,
        hasEtag: Boolean(snapshot.etag),
        durationMs: Date.now() - startedAt
      })
      return snapshot
    } catch (error) {
      // Do not log source URLs, response bodies, or signed credentials.
      // biome-ignore lint/suspicious/noConsole: Manifest diagnostics are intentionally console-only.
      console.error(LOG_PREFIX, 'fetch.failed', {
        httpStatus,
        retainedCache: Boolean(snapshot),
        errorType: error instanceof Error ? error.name : 'UnknownError',
        durationMs: Date.now() - startedAt
      })
      throw error
    }
  }

  const refresh = (): Promise<Snapshot> => {
    if (inFlight) return inFlight
    inFlight = download().finally(() => {
      completedChecks += 1
      inFlight = undefined
    })
    return inFlight
  }

  const read = async (schedule: ScheduleAfterResponse): Promise<UseCaseManifestEntry[]> => {
    const current = snapshot
    if (!current) return (await refresh()).entries
    // biome-ignore lint/suspicious/noConsole: Manifest diagnostics are intentionally console-only.
    console.info(LOG_PREFIX, 'cache.hit', { count: current.entries.length })
    const observedChecks = completedChecks
    schedule(async () => {
      // Delayed callbacks from the same request wave need not check twice.
      if (completedChecks !== observedChecks) return
      try {
        await refresh()
      } catch {
        // download() logged the failure; a later request retries without a TTL.
      }
    })
    return current.entries
  }
  return { read }
}
