import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { JsonLd } from '@/components/json-ld'

describe('JsonLd', () => {
  test('escapes less-than characters before injecting structured data into a script tag', () => {
    const html = renderToStaticMarkup(
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          description: '</script><script>alert(1)</script>'
        }}
      />
    )

    expect(html).not.toContain('</script><script>')
    expect(html).toContain('\\u003c/script>')
  })
})
