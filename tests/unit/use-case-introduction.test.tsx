import { afterEach, expect, mock, spyOn, test } from 'bun:test'
import { renderToReadableStream } from 'react-dom/server'

const detail = {
  slug: 'sample-case',
  title: 'Sample case',
  hasReplay: false,
  introductionUrl: 'https://cdn.example.test/intro.md',
  package: {
    url: 'https://cdn.example.test/sample.science',
    filename: 'sample.science',
    sizeBytes: 1,
    sha256: ''
  }
}
mock.module('@/service/open-science-use-cases.server', () => ({
  fetchUseCaseDetail: async () => detail,
  fetchUseCaseList: async () => [detail]
}))
const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
  mock.restore()
})

const renderIntroduction = async () => {
  const { default: Page } = await import(
    '../../app/(commonLayout)/open-science/use-cases/[id]/page'
  )
  const tree = await Page({ params: Promise.resolve({ id: 'sample-case' }) })
  return new Response(await renderToReadableStream(tree)).text()
}

test('renders introductions through the shared Markdown typography and GFM renderer', async () => {
  globalThis.fetch = mock(
    async () =>
      new Response(
        '# Findings\n\n- First result\n\n| Metric | Value |\n| --- | --- |\n| Count | 2 |\n\nLiteral {1 + 1}.'
      )
  ) as unknown as typeof fetch
  const html = await renderIntroduction()
  expect(html).toContain('class="markdown-body"')
  expect(html).toContain('<h1 id="heading-findings">Findings</h1>')
  expect(html).toContain('<li>First result</li>')
  expect(html).toContain('<td>2</td>')
  expect(html).toContain('Literal {1 + 1}.')
})

test('keeps the case and download available when the optional introduction body fails', async () => {
  spyOn(console, 'error').mockImplementation(() => {})
  globalThis.fetch = mock(
    async () =>
      new Response(
        new ReadableStream({
          start: (controller) => controller.error(new Error('Body interrupted'))
        })
      )
  ) as unknown as typeof fetch
  const html = await renderIntroduction()
  expect(html).toContain('Sample case')
  expect(html).toContain('Download research package')
  expect(html).not.toContain('What this research found')
})
