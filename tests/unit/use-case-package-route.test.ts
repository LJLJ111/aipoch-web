import { afterEach, expect, mock, test } from 'bun:test'

const info = {
  url: 'https://github.com/org/repo/releases/download/v1/case.science',
  filename: 'case.science',
  sizeBytes: 321,
  sha256: 'a'.repeat(64)
}
const fetchDetail = mock(
  async (_slug: string): Promise<{ package: typeof info } | null> => ({ package: info })
)
mock.module('@/service/open-science-use-cases.server', () => ({ fetchUseCaseDetail: fetchDetail }))
const { GET } = await import('../../app/internal/use-cases/[slug]/route')
afterEach(() => {
  fetchDetail.mockReset().mockResolvedValue({ package: info })
})
const request = () =>
  GET(new Request('https://example.com/internal/use-cases/example'), {
    params: Promise.resolve({ slug: 'example' })
  })
test('returns cached package metadata without downloading the archive', async () => {
  const originalFetch = globalThis.fetch
  const fetchSpy = mock(() => {
    throw new Error('Server must not download packages')
  })
  globalThis.fetch = fetchSpy as unknown as typeof fetch
  try {
    const response = await request()
    expect(await response.json()).toEqual(info)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(fetchDetail).toHaveBeenCalledWith('example')
    expect(fetchSpy).not.toHaveBeenCalled()
  } finally {
    globalThis.fetch = originalFetch
  }
})
test('returns distinct missing and unavailable errors', async () => {
  fetchDetail.mockResolvedValueOnce(null)
  expect((await request()).status).toBe(404)
  fetchDetail.mockRejectedValueOnce(new Error('Manifest offline'))
  expect((await request()).status).toBe(503)
})
