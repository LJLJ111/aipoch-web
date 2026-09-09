import { XMLParser, XMLValidator } from 'fast-xml-parser'
import type { MetadataRoute } from 'next'
import { OPENSCIENCE_WIKI_INTERNAL_URL_PREFIX, SITE_DOMAIN } from '@/lib/config'

interface WikiSitemapItem {
  loc?: unknown
  lastmod?: unknown
  changefreq?: unknown
  priority?: unknown
}

const sitemapChangeFrequencies = new Set<
  NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
>(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])

const MAX_WIKI_SITEMAP_BYTES = 5 * 1024 * 1024
const MAX_WIKI_SITEMAP_URLS = 10_000

const wikiSitemapParser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  trimValues: true
})

function canonicalizeWikiSitemapUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) {
    return null
  }

  try {
    const url = new URL(value)
    const canonical = new URL(SITE_DOMAIN)
    const hostname = url.hostname.toLowerCase()
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    if (hostname === canonical.hostname || hostname === `www.${canonical.hostname}`) {
      url.protocol = canonical.protocol
      url.hostname = canonical.hostname
      url.port = canonical.port
    }

    url.username = ''
    url.password = ''
    return url.toString()
  } catch {
    return null
  }
}

async function readWikiSitemapBody(response: Response): Promise<string | undefined> {
  if (!response.body) {
    return ''
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      totalBytes += value.byteLength
      if (totalBytes > MAX_WIKI_SITEMAP_BYTES) {
        await reader.cancel()
        return undefined
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return new TextDecoder().decode(body)
}

function parseWikiSitemap(xml: string): MetadataRoute.Sitemap {
  if (XMLValidator.validate(xml) !== true) {
    return []
  }

  const parsed = wikiSitemapParser.parse(xml) as {
    urlset?: { url?: WikiSitemapItem | WikiSitemapItem[] }
  }
  const rawItems = parsed.urlset?.url
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : []
  if (items.length > MAX_WIKI_SITEMAP_URLS) {
    return []
  }

  return items.flatMap((item) => {
    const canonicalUrl = canonicalizeWikiSitemapUrl(item.loc)
    if (!canonicalUrl) {
      return []
    }

    const route: MetadataRoute.Sitemap[number] = { url: canonicalUrl }

    if (typeof item.lastmod === 'string') {
      const lastModified = new Date(item.lastmod)
      if (!Number.isNaN(lastModified.getTime())) {
        route.lastModified = lastModified
      }
    }

    if (
      typeof item.changefreq === 'string' &&
      sitemapChangeFrequencies.has(
        item.changefreq as NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
      )
    ) {
      route.changeFrequency = item.changefreq as NonNullable<
        MetadataRoute.Sitemap[number]['changeFrequency']
      >
    }

    if (typeof item.priority === 'string') {
      const priority = Number(item.priority)
      if (Number.isFinite(priority) && priority >= 0 && priority <= 1) {
        route.priority = priority
      }
    }

    return [route]
  })
}

export async function fetchOpenScienceWikiSitemap(): Promise<MetadataRoute.Sitemap> {
  if (!OPENSCIENCE_WIKI_INTERNAL_URL_PREFIX) {
    return []
  }

  try {
    // Pull the XML over the private Docker network; the URL is never sent to clients.
    const sitemapUrl = `${OPENSCIENCE_WIKI_INTERNAL_URL_PREFIX.replace(/\/+$/, '')}/sitemap`
    const response = await fetch(sitemapUrl, {
      headers: { Accept: 'application/xml' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000)
    })
    if (!response.ok) {
      await response.body?.cancel()
      return []
    }

    const contentLength = Number(response.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > MAX_WIKI_SITEMAP_BYTES) {
      await response.body?.cancel()
      return []
    }

    const xml = await readWikiSitemapBody(response)
    return xml === undefined ? [] : parseWikiSitemap(xml)
  } catch {
    return []
  }
}
