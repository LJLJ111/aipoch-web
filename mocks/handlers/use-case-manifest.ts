import { HttpResponse, http } from 'msw'
import { useCaseManifest } from '../fixtures'

/** The HTTP adapter owns mock revisions, so SSR and browsers see one object version. */
export const useCaseManifestHandlers = (origin: string) => {
  let revision = 1
  let mode = 'normal'
  let titleSuffix = ''
  let delayMs = 0
  let requests = 0
  let notModified = 0
  let lastValidator: string | null = null
  return [
    http.get(`${origin}/use-case-manifest/manifest.json`, async ({ request }) => {
      requests += 1
      lastValidator = request.headers.get('if-none-match')
      const validator = lastValidator
      const responseMode = mode
      const responseSuffix = titleSuffix
      const etag = `"use-case-manifest-${revision}"`
      const headers = { ETag: etag, 'Cache-Control': 'no-store' }
      if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs))
      if (responseMode === 'error') return new HttpResponse(null, { status: 503 })
      if (responseMode === 'invalid') return HttpResponse.text('invalid json', { headers })
      if (validator === etag) {
        notModified += 1
        return new HttpResponse(null, { status: 304, headers })
      }
      return HttpResponse.json(
        responseMode === 'empty'
          ? []
          : useCaseManifest.map((item) => ({
              ...item,
              title: `${item.title}${responseSuffix}`,
              case: { ...item.case, release_url: '' }
            })),
        { headers }
      )
    }),
    // Development-only controls and counters make after-response refresh observable.
    http.get(`${origin}/__mock/use-case-manifest`, () =>
      HttpResponse.json({
        revision,
        requests,
        notModified,
        lastValidator
      })
    ),
    http.put(`${origin}/__mock/use-case-manifest`, async ({ request }) => {
      const update = (await request.json()) as {
        mode?: string
        titleSuffix?: string
        delayMs?: number
      }
      if (
        (update.mode !== undefined &&
          !['normal', 'empty', 'error', 'invalid'].includes(update.mode)) ||
        (update.titleSuffix !== undefined && typeof update.titleSuffix !== 'string') ||
        (update.delayMs !== undefined &&
          (!Number.isInteger(update.delayMs) || update.delayMs < 0 || update.delayMs > 5000))
      )
        return new HttpResponse(null, { status: 400 })
      mode = update.mode ?? 'normal'
      titleSuffix = update.titleSuffix ?? ''
      delayMs = update.delayMs ?? 0
      revision += 1
      return HttpResponse.json({ revision })
    }),
    http.get(`${origin}/use-case-manifest/*`, ({ request }) => {
      const path = decodeURIComponent(
        new URL(request.url).pathname.slice('/use-case-manifest/'.length)
      )
      for (const item of useCaseManifest) {
        if (path === item.cover.path) {
          return new HttpResponse(
            '<svg xmlns="http://www.w3.org/2000/svg" width="626" height="292"><rect width="626" height="292" fill="#e8e8e4"/><text x="30" y="150" font-size="32">Research case preview</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          )
        }
        if (path === item.introduction?.path)
          return HttpResponse.text(`# ${item.title}\n\nLocal sample introduction.`, {
            headers: { 'Content-Type': 'text/markdown' }
          })
        if (path === item.case.path)
          return HttpResponse.text('Local sample, not a .science archive.', {
            headers: { 'Content-Disposition': 'attachment; filename="sample.science"' }
          })
      }
      return new HttpResponse(null, { status: 404 })
    })
  ]
}
