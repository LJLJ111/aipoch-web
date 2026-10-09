import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'
import { createUseCaseManifestCache, parseUseCaseManifest } from '../../lib/use-case-manifest'
import manifest from '../../mocks/fixtures/use-case-manifest.json'

const url = 'https://objects.example.test/cases/manifest.json'
const originalFetch = globalThis.fetch
const body = (etag?: string, value: unknown = manifest) =>
  new Response(JSON.stringify(value), { headers: etag ? { ETag: etag } : {} })
const deferred = () => Promise.withResolvers<Response>()
afterEach(() => {
  globalThis.fetch = originalFetch
  mock.restore()
})

describe('use-case manifest normalization', () => {
  test('maps the supplied schema without inventing export or replay metadata', () => {
    const cases = parseUseCaseManifest(manifest, url)
    expect(cases).toHaveLength(9)
    expect(cases[0]).toMatchObject({
      slug: manifest[0].name,
      title: manifest[0].title,
      preview: {
        image:
          'https://objects.example.test/cases/can-a-simple-algorithm-beat-ai-at-wordle/Can%20a%20Simple%20Algorithm%20Beat%20AI%20at%20Wordle.png'
      },
      package: { sizeBytes: manifest[0].case.bytes },
      hasReplay: false
    })
    expect(cases[0].exportedAt).toBeUndefined()
    expect(cases[0].introductionUrl).toEndWith('.md')
    expect(cases[3].package.url).toBe(manifest[3].case.release_url)
    expect(cases[3].introductionUrl).toBeUndefined()
  })

  test('uses the case name and encodes the file name as one URL segment', () => {
    const [entry] = parseUseCaseManifest(
      [{ ...manifest[0], cover: { ...manifest[0].cover, file_name: '图 #1?100%.png' } }],
      url
    )
    expect(entry.preview?.image).toBe(
      'https://objects.example.test/cases/can-a-simple-algorithm-beat-ai-at-wordle/%E5%9B%BE%20%231%3F100%25.png'
    )
    expect(entry.package.url).toBe(
      'https://objects.example.test/cases/can-a-simple-algorithm-beat-ai-at-wordle/Can%20a%20Simple%20Algorithm%20Beat%20AI%20at%20Wordle.science'
    )
    expect(entry.introductionUrl).toBe(
      'https://objects.example.test/cases/can-a-simple-algorithm-beat-ai-at-wordle/Can%20a%20Simple%20Algorithm%20Beat%20AI%20at%20Wordle.md'
    )
    for (const file_name of ['.', '..', '../cover.png', 'a/b.png', 'a\\b.png', 'cover\u0000.png']) {
      expect(() =>
        parseUseCaseManifest([{ ...manifest[0], cover: { ...manifest[0].cover, file_name } }], url)
      ).toThrow()
    }
  })

  test('accepts an empty manifest and rejects duplicate slugs or invalid resources', () => {
    expect(parseUseCaseManifest([], url)).toEqual([])
    expect(() => parseUseCaseManifest([manifest[0], manifest[0]], url)).toThrow()
    for (const path of ['../cover.png', '/cover.png', 'https://evil.test/a', 'a/../b', 'a\\b']) {
      expect(() =>
        parseUseCaseManifest([{ ...manifest[0], cover: { ...manifest[0].cover, path } }], url)
      ).toThrow()
    }
    expect(() =>
      parseUseCaseManifest(
        [{ ...manifest[0], case: { ...manifest[0].case, release_url: 'javascript:alert(1)' } }],
        url
      )
    ).toThrow()
    expect(() =>
      parseUseCaseManifest([{ ...manifest[0], cover: { ...manifest[0].cover, bytes: -1 } }], url)
    ).toThrow()
    expect(() => parseUseCaseManifest({}, url)).toThrow()
  })
})

describe('use-case manifest cache', () => {
  test('coalesces cold loads, returns stale data immediately, and sends the exact ETag after response', async () => {
    const first = deferred()
    const next = deferred()
    const fetcher = mock()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => next.promise)
    globalThis.fetch = fetcher as unknown as typeof fetch
    const cache = createUseCaseManifestCache(url)
    const tasks: Array<() => Promise<void>> = []
    const schedule = (task: () => Promise<void>) => tasks.push(task)
    const a = cache.read(schedule)
    const b = cache.read(schedule)
    expect(fetcher).toHaveBeenCalledTimes(1)
    first.resolve(body('"v1"'))
    const original = await a
    expect(await b).toBe(original)
    expect(tasks).toHaveLength(0)
    expect(await cache.read(schedule)).toBe(original)
    expect(await cache.read(schedule)).toBe(original)
    expect(fetcher).toHaveBeenCalledTimes(1)
    const refreshes = tasks.splice(0).map((task) => task())
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[1][1]).toMatchObject({
      cache: 'no-store',
      headers: { 'If-None-Match': '"v1"' }
    })
    next.resolve(body('"v2"', [{ ...manifest[0], title: 'Updated title' }]))
    await Promise.all(refreshes)
    const updated = await cache.read(schedule)
    expect(updated[0].title).toBe('Updated title')
    expect(original[0].title).toBe(manifest[0].title)
  })

  test('checks on every later request without a TTL and retains the snapshot on 304', async () => {
    const fetcher = mock()
      .mockResolvedValueOnce(body('W/"v1"'))
      .mockImplementation(() => Promise.resolve(new Response(null, { status: 304 })))
    globalThis.fetch = fetcher as unknown as typeof fetch
    const cache = createUseCaseManifestCache(url)
    const tasks: Array<() => Promise<void>> = []
    const schedule = (task: () => Promise<void>) => tasks.push(task)
    const original = await cache.read(schedule)
    for (let i = 0; i < 3; i++) {
      expect(await cache.read(schedule)).toBe(original)
      await tasks.shift()?.()
    }
    expect(fetcher).toHaveBeenCalledTimes(4)
    expect(fetcher.mock.calls[3][1].headers['If-None-Match']).toBe('W/"v1"')
  })

  test('keeps data and ETag on failed refreshes and retries on the next request', async () => {
    spyOn(console, 'error').mockImplementation(() => {})
    const responses = [
      body('"good"'),
      new Response('bad json'),
      body('"bad"', {}),
      new Response(null, { status: 503 }),
      body('"recovered"', [])
    ]
    const fetcher = mock(
      async (_input: unknown, _options?: RequestInit) => responses.shift() as Response
    )
    globalThis.fetch = fetcher as unknown as typeof fetch
    const cache = createUseCaseManifestCache(url)
    const tasks: Array<() => Promise<void>> = []
    const schedule = (task: () => Promise<void>) => tasks.push(task)
    const original = await cache.read(schedule)
    for (let i = 0; i < 4; i++) {
      expect(await cache.read(schedule)).toBe(original)
      await tasks.shift()?.()
      expect(new Headers(fetcher.mock.calls.at(-1)?.[1]?.headers).get('If-None-Match')).toBe(
        '"good"'
      )
    }
    expect(await cache.read(schedule)).toEqual([])
  })

  test('rejects a failed cold load then permits retry; a response without ETag uses unconditional GET', async () => {
    spyOn(console, 'error').mockImplementation(() => {})
    const fetcher = mock()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(body())
      .mockResolvedValueOnce(body('"new"'))
    globalThis.fetch = fetcher as unknown as typeof fetch
    const cache = createUseCaseManifestCache(url)
    const tasks: Array<() => Promise<void>> = []
    const schedule = (task: () => Promise<void>) => tasks.push(task)
    await expect(cache.read(schedule)).rejects.toThrow()
    await cache.read(schedule)
    await cache.read(schedule)
    await tasks.shift()?.()
    expect(fetcher.mock.calls[2][1].headers).toEqual({})
  })

  test('logs cache misses, every hit, unchanged checks and successful snapshot updates', async () => {
    const info = spyOn(console, 'info').mockImplementation(() => {})
    const error = spyOn(console, 'error').mockImplementation(() => {})
    globalThis.fetch = mock()
      .mockResolvedValueOnce(body('"v1"'))
      .mockResolvedValueOnce(new Response(null, { status: 304 }))
      .mockResolvedValueOnce(body('"v2"', [manifest[0]]))
      .mockResolvedValueOnce(body('"invalid"', {})) as unknown as typeof fetch
    const cache = createUseCaseManifestCache(url)
    const tasks: Array<() => Promise<void>> = []
    const schedule = (task: () => Promise<void>) => tasks.push(task)

    await cache.read(schedule)
    expect(info).toHaveBeenCalledWith('[use-case-manifest]', 'cache.miss')
    expect(info).toHaveBeenCalledWith('[use-case-manifest]', 'cache.updated', {
      reason: 'initial-load',
      previousEtag: null,
      etag: '"v1"',
      count: 9,
      durationMs: expect.any(Number)
    })

    await cache.read(schedule)
    expect(info).toHaveBeenCalledWith('[use-case-manifest]', 'cache.hit', {
      etag: '"v1"',
      count: 9
    })
    await tasks.shift()?.()
    expect(info).toHaveBeenCalledWith('[use-case-manifest]', 'cache.unchanged', {
      etag: '"v1"',
      count: 9,
      durationMs: expect.any(Number)
    })
    await cache.read(schedule)
    await tasks.shift()?.()
    expect(info).toHaveBeenCalledWith('[use-case-manifest]', 'cache.updated', {
      reason: 'refresh',
      previousEtag: '"v1"',
      etag: '"v2"',
      count: 1,
      durationMs: expect.any(Number)
    })

    await cache.read(schedule)
    await tasks.shift()?.()
    // Rejected data must not announce a cache update or change the version in hit logs.
    expect(error).toHaveBeenCalledWith(
      '[use-case-manifest]',
      'fetch.failed',
      expect.objectContaining({ retainedCache: true })
    )
    await cache.read(schedule)
    expect(info).toHaveBeenLastCalledWith('[use-case-manifest]', 'cache.hit', {
      etag: '"v2"',
      count: 1
    })
    expect(info.mock.calls.filter((call) => call[1] === 'cache.updated')).toHaveLength(2)
    expect(info.mock.calls.filter((call) => call[1] === 'cache.hit')).toHaveLength(4)
    const logs = JSON.stringify([...info.mock.calls, ...error.mock.calls])
    expect(logs).not.toContain(url)
    expect(logs).not.toContain(manifest[0].title)
  })

  test('rejects an unsolicited 304 and logs cache events only through console', async () => {
    const info = spyOn(console, 'info').mockImplementation(() => {})
    const error = spyOn(console, 'error').mockImplementation(() => {})
    globalThis.fetch = mock(
      async () => new Response(null, { status: 304 })
    ) as unknown as typeof fetch
    await expect(createUseCaseManifestCache(url).read(() => {})).rejects.toThrow()
    expect(info).toHaveBeenCalled()
    expect(error).toHaveBeenCalled()
    expect(JSON.stringify(error.mock.calls)).not.toContain(url)
  })
})
