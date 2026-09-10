import { afterEach, describe, expect, test } from 'bun:test'
import {
  fetchHomepageConfig,
  fetchHomepageReadWatch,
  OPEN_SCIENCE_HOMEPAGE_MODULE
} from '../../service/homepage'

describe('homepage public services', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('fetchHomepageConfig GETs /v1/homepage/{module}', async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = []
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push([input, init])
      return new Response(
        JSON.stringify({
          code: 20000,
          msg: 'Success',
          data: {
            release_version: 'v0.10.1',
            latest_release_update: 'Aug 4, 2026',
            latest_release_title: 'v0.10.1',
            latest_release_desc: 'Release description',
            latest_release_features: [{ title: 'Branch', text: 'start a new session' }],
            media: [{ title: 'Product tour', url: 'https://cdn.example.com/tour.mp4' }],
            what_it_does: [{ title: 'Local-first', text: 'stays on your computer' }]
          }
        }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const data = await fetchHomepageConfig(OPEN_SCIENCE_HOMEPAGE_MODULE)

    expect(String(calls[0]?.[0])).toMatch(/\/v1\/homepage\/openscience$/)
    expect(calls[0]?.[1]?.cache).toBe('no-store')
    expect(calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal)
    expect(data?.release_version).toBe('v0.10.1')
  })

  test('fetchHomepageConfig returns null when the request is aborted', async () => {
    globalThis.fetch = (async () => {
      const error = new DOMException('The operation was aborted.', 'AbortError')
      throw error
    }) as unknown as typeof fetch

    await expect(fetchHomepageConfig(OPEN_SCIENCE_HOMEPAGE_MODULE)).resolves.toBeNull()
  })

  test('fetchHomepageReadWatch GETs /v1/homepage/{module}/read-watch', async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = []
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push([input, init])
      return new Response(
        JSON.stringify({
          code: 20000,
          msg: 'Success',
          data: {
            items: [
              {
                title: 'Release notes',
                category: 'Product',
                published_at: '2026-08-04T00:00:00.000Z',
                slug: 'release-notes'
              }
            ]
          }
        }),
        { status: 200 }
      )
    }) as unknown as typeof fetch

    const data = await fetchHomepageReadWatch(OPEN_SCIENCE_HOMEPAGE_MODULE)

    expect(String(calls[0]?.[0])).toMatch(/\/v1\/homepage\/openscience\/read-watch$/)
    expect(calls[0]?.[1]?.cache).toBe('no-store')
    expect(data).toEqual({
      items: [
        {
          title: 'Release notes',
          category: 'Product',
          published_at: '2026-08-04T00:00:00.000Z',
          slug: 'release-notes'
        }
      ]
    })
  })

  test('fetchHomepageReadWatch returns null on failure', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch

    await expect(fetchHomepageReadWatch(OPEN_SCIENCE_HOMEPAGE_MODULE)).resolves.toBeNull()
  })

  test('fetchHomepageSkillsCount returns the current published total', async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = []
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push([input, init])
      return new Response(
        JSON.stringify({
          code: 20000,
          msg: 'Success',
          data: { total_skills: 597, total_authors: 3 }
        }),
        { status: 200 }
      )
    }) as unknown as typeof fetch
    const homepageService = (await import('../../service/homepage')) as Record<string, unknown>
    const fetchHomepageSkillsCount = homepageService.fetchHomepageSkillsCount

    expect(fetchHomepageSkillsCount).toBeFunction()
    if (typeof fetchHomepageSkillsCount !== 'function') return

    await expect(fetchHomepageSkillsCount()).resolves.toBe(597)
    expect(String(calls[0]?.[0])).toMatch(/\/v1\/skills\/total_count$/)
    expect(calls[0]?.[1]?.cache).toBe('no-store')
  })

  test('E2E_HOMEPAGE_MOCK returns fixtures without calling fetch', async () => {
    process.env.E2E_HOMEPAGE_MOCK = '1'
    let fetchCalled = false
    globalThis.fetch = (async () => {
      fetchCalled = true
      throw new Error('should not fetch')
    }) as unknown as typeof fetch

    try {
      const config = await fetchHomepageConfig(OPEN_SCIENCE_HOMEPAGE_MODULE)
      const readWatch = await fetchHomepageReadWatch(OPEN_SCIENCE_HOMEPAGE_MODULE)
      expect(fetchCalled).toBe(false)
      expect(config?.release_version).toBe('v0.16.0')
      expect(readWatch?.items[0]?.slug).toBe('release-notes')
    } finally {
      delete process.env.E2E_HOMEPAGE_MOCK
    }
  })

  test('ignores E2E_HOMEPAGE_MOCK when NODE_ENV is production', async () => {
    process.env.E2E_HOMEPAGE_MOCK = '1'
    const previousNodeEnv = process.env.NODE_ENV
    Object.assign(process.env, { NODE_ENV: 'production' })
    let fetchCalled = false
    globalThis.fetch = (async () => {
      fetchCalled = true
      return new Response(JSON.stringify({ code: 20000, msg: 'Success', data: null }), {
        status: 200
      })
    }) as unknown as typeof fetch

    try {
      await expect(fetchHomepageConfig(OPEN_SCIENCE_HOMEPAGE_MODULE)).resolves.toBeNull()
      expect(fetchCalled).toBe(true)
    } finally {
      delete process.env.E2E_HOMEPAGE_MOCK
      Object.assign(process.env, { NODE_ENV: previousNodeEnv })
    }
  })
})
