import { expect, test } from 'bun:test'
import { getResponse } from 'msw'
import { useCaseManifestHandlers } from '../../mocks/handlers/use-case-manifest'

test('mock object storage supports conditional GET, updates, empty data and failure', async () => {
  const origin = 'http://127.0.0.1:3203'
  const handlers = useCaseManifestHandlers(origin)
  const request = async (path: string, init?: RequestInit) => {
    const result = await getResponse(handlers, new Request(`${origin}${path}`, init))
    if (!result) throw new Error('Unmocked request')
    return result
  }
  const first = await request('/use-case-manifest/manifest.json')
  expect(first.status).toBe(200)
  const etag = first.headers.get('etag') as string
  const data = await first.json()
  expect(data).toHaveLength(9)
  const unchanged = await request('/use-case-manifest/manifest.json', {
    headers: { 'If-None-Match': etag }
  })
  expect(unchanged.status).toBe(304)
  expect(await unchanged.text()).toBe('')
  await request('/__mock/use-case-manifest', {
    method: 'PUT',
    body: JSON.stringify({ titleSuffix: ' updated' })
  })
  const updated = await request('/use-case-manifest/manifest.json', {
    headers: { 'If-None-Match': etag }
  })
  expect(updated.status).toBe(200)
  expect((await updated.json())[0].title).toEndWith(' updated')
  for (const [mode, status] of [
    ['empty', 200],
    ['error', 503],
    ['invalid', 200]
  ] as const) {
    await request('/__mock/use-case-manifest', { method: 'PUT', body: JSON.stringify({ mode }) })
    const response = await request('/use-case-manifest/manifest.json')
    expect(response.status).toBe(status)
    if (mode === 'empty') expect(await response.json()).toEqual([])
    if (mode === 'invalid') expect(await response.text()).toBe('invalid json')
  }
  const stats = await (await request('/__mock/use-case-manifest')).json()
  expect(stats.requests).toBe(6)
  expect(stats.notModified).toBe(1)
})
