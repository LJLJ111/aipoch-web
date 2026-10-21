import { expect, test } from 'bun:test'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { renderToReadableStream } from 'react-dom/server'
import {
  ReplayLoading,
  ReplayView
} from '../../app/(commonLayout)/open-science/use-cases/_components/replay-view'

const packageInfo = {
  url: 'https://example.test/research.science',
  filename: 'research.science',
  sizeBytes: 1024,
  sha256: ''
}
const unexpectedNavigation = () => {
  throw new Error('SSR must not navigate')
}
const router = {
  back: unexpectedNavigation,
  forward: unexpectedNavigation,
  refresh: unexpectedNavigation,
  push: unexpectedNavigation,
  replace: unexpectedNavigation,
  prefetch: unexpectedNavigation
}
const render = async (tree: React.ReactNode) =>
  new Response(
    await renderToReadableStream(
      <AppRouterContext.Provider value={router}>{tree}</AppRouterContext.Provider>
    )
  ).text()

test('offers import after download in the replay toolbar while the transcript is still loading', async () => {
  const html = await render(<ReplayView slug="sample" packageInfo={packageInfo} />)
  expect(html).toContain('Downloading research package…')
  expect(html).toContain('aria-label="Replay import actions"')
  expect(html).toContain('Continue in Open-Science')
  expect(html.indexOf('Download research package')).toBeLessThan(
    html.indexOf('Continue in Open-Science')
  )
  expect(html).toMatch(/<button[^>]*bg-\[#10110f\][^>]*text-white/)
  expect(html).not.toContain('Allow app and local network access if prompted. Keep this page open.')
  const toolbar = html.slice(html.indexOf('aria-label="Replay import actions"'))
  expect(toolbar.indexOf('aria-label="Replay import feedback"')).toBeLessThan(
    toolbar.indexOf('</section>')
  )
  expect(html).not.toContain('What would you explore next?')
})

test('keeps the overview return and retry available without unusable import controls when package metadata is absent', async () => {
  for (const tree of [
    <ReplayLoading key="loading" slug="sample" />,
    <ReplayView key="missing" slug="sample" packageInfo={null} />
  ]) {
    const html = await render(tree)
    expect(html).toContain('/open-science/use-cases/sample')
    expect(html).not.toContain('Continue in Open-Science')
    expect(html).not.toContain('Download research package')
  }
})
