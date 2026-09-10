import { beforeEach, describe, expect, mock, test } from 'bun:test'

const siteDomain = 'https://aipoch.com'
const wikiSourceDomain = 'https://www.aipoch.com'
const wikiSitemapUrlPrefix = 'http://openscience-wiki/'
const wikiSitemapUrl = 'http://openscience-wiki/sitemap'

let wikiSitemapXml = '<?xml version="1.0"?><urlset></urlset>'
let wikiSitemapStatus = 200
let wikiSitemapError: Error | undefined
let wikiRequestSignal: AbortSignal | null | undefined
let wikiSitemapContentLength: string | undefined
let wikiSitemapResponseFactory: (() => Response) | undefined

mock.module('@/lib/config', () => ({
  AIPOCH_DESIGN_SYSTEM_URL: 'https://design-system.aipoch.com/',
  AIPOCH_GITHUB_URL: 'https://github.com/aipoch/medical-research-skills',
  API_URL: '/api',
  CLARITY_ID: '',
  COOKIE_POLICY_VERSION: 'v2',
  GOOGLE_ANALYTICS_ID: '',
  INTERNAL_API_URL: 'https://internal.example.test',
  OPENSCIENCE_WIKI_INTERNAL_URL_PREFIX: wikiSitemapUrlPrefix,
  OPENSCIENCE_WIKI_URL_PREFIX: '',
  SITE_DOMAIN: siteDomain,
  STATIC_ASSETS_ORIGIN: 'https://statics.aipoch.com',
  SUPPORT_EMAIL: 'support@aipoch.com'
}))

globalThis.fetch = mock(async (input, init) => {
  if (input.toString() !== wikiSitemapUrl) {
    throw new Error(`Unexpected request to ${input}`)
  }

  wikiRequestSignal = init?.signal

  if (wikiSitemapError) {
    throw wikiSitemapError
  }

  if (wikiSitemapResponseFactory) {
    return wikiSitemapResponseFactory()
  }

  const headers = new Headers({ 'Content-Type': 'application/xml' })
  if (wikiSitemapContentLength) {
    headers.set('Content-Length', wikiSitemapContentLength)
  }

  return new Response(wikiSitemapXml, {
    status: wikiSitemapStatus,
    headers
  })
}) as unknown as typeof fetch

describe('Open-Science Wiki sitemap', () => {
  beforeEach(() => {
    wikiSitemapXml = '<?xml version="1.0"?><urlset></urlset>'
    wikiSitemapStatus = 200
    wikiSitemapError = undefined
    wikiRequestSignal = undefined
    wikiSitemapContentLength = undefined
    wikiSitemapResponseFactory = undefined
  })

  test('parses XML entries and optional metadata', async () => {
    wikiSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${wikiSourceDomain}/docs/getting-started</loc>
          <lastmod>2026-08-17T08:30:00.000Z</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
        <url>
          <loc>${wikiSourceDomain}/docs/research-and-development?area=a&amp;phase=b</loc>
        </url>
      </urlset>`

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    const routes = await fetchOpenScienceWikiSitemap()

    expect(routes).toEqual([
      {
        url: `${siteDomain}/docs/getting-started`,
        lastModified: new Date('2026-08-17T08:30:00.000Z'),
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${siteDomain}/docs/research-and-development?area=a&phase=b`
      }
    ])
  })

  test('returns no routes when the endpoint responds unsuccessfully', async () => {
    wikiSitemapStatus = 503

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([])
  })

  test('returns no routes when the request fails', async () => {
    wikiSitemapError = new Error('Wiki container is unavailable')

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([])
  })

  test('bounds the request with an abort signal', async () => {
    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    await fetchOpenScienceWikiSitemap()

    expect(wikiRequestSignal).toBeInstanceOf(AbortSignal)
  })

  test('omits a sitemap whose declared body is too large', async () => {
    wikiSitemapContentLength = String(5 * 1024 * 1024 + 1)

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([])
  })

  test('stops reading a sitemap that exceeds the body limit', async () => {
    wikiSitemapXml = `<urlset>
      <url><loc>${siteDomain}/docs/streamed-oversized</loc></url>
      <!--${'x'.repeat(5 * 1024 * 1024)}-->
    </urlset>`

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([])
  })

  test('omits a sitemap that exceeds the URL limit', async () => {
    const items = Array.from(
      { length: 10_001 },
      (_, index) => `<url><loc>${siteDomain}/docs/generated-${index}</loc></url>`
    ).join('')
    wikiSitemapXml = `<urlset>${items}</urlset>`

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([])
  })

  test('omits routes when the XML is malformed', async () => {
    wikiSitemapXml = `<urlset><url><loc>${siteDomain}/docs/broken</loc></urlset>`

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([])
  })

  test('omits entries whose loc is not an absolute HTTP URL', async () => {
    wikiSitemapXml = `<urlset>
      <url><loc>/docs/relative</loc></url>
      <url><loc>javascript:alert(1)</loc></url>
    </urlset>`

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([])
  })

  test.each([
    'http',
    'https'
  ])('keeps absolute %s entries from another origin', async (protocol) => {
    const wikiUrl = `${protocol}://external.example/docs/trusted`

    wikiSitemapXml = `<urlset>
      <url><loc>${wikiUrl}</loc></url>
    </urlset>`

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    expect(await fetchOpenScienceWikiSitemap()).toEqual([{ url: wikiUrl }])
  })

  test.each([
    ['unsuccessful', 503, undefined],
    ['declared oversized', 200, String(5 * 1024 * 1024 + 1)]
  ])('cancels a %s response body before returning', async (_, status, contentLength) => {
    let cancelled = false
    wikiSitemapResponseFactory = () => {
      const headers = new Headers({ 'Content-Type': 'application/xml' })
      if (contentLength) {
        headers.set('Content-Length', contentLength)
      }

      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('<urlset>'))
          },
          cancel() {
            cancelled = true
          }
        }),
        { status, headers }
      )
    }

    const { fetchOpenScienceWikiSitemap } = await import('../../service/wiki-sitemap')

    await fetchOpenScienceWikiSitemap()

    expect(cancelled).toBe(true)
  })
})
