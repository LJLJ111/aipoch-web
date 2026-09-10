import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { Footer } from '../../components/footer'

describe('footer', () => {
  test('renders legal links', () => {
    const html = renderToStaticMarkup(<Footer />)

    expect(html).toContain('href="/terms-of-service"')
    expect(html).toContain('href="/privacy-policy"')
    expect(html).toContain('href="/cookie-policy"')
  })

  test('renders the updated AIPOCH copyright and cookie action copy', () => {
    const html = renderToStaticMarkup(<Footer />)

    expect(html).toContain('© 2026 AIPOCH. All Rights Reserved.')
    expect(html).toContain('Manage Cookies')
    expect(html).not.toContain('AIPOCH Intelligence')
    expect(html).not.toContain('See ')
  })
})
