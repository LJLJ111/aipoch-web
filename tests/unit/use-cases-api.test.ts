import { describe, expect, test } from 'bun:test'
import { getResponse } from 'msw'
import { createHandlers } from '../../mocks/handlers'

const handle = async (path: string) => {
  const handlers = createHandlers('http://127.0.0.1:3203')
  return (
    (await getResponse(handlers, new Request(`http://127.0.0.1:3203${path}`))) ??
    new Response(null, { status: 404 })
  )
}

describe('open-science use-case mock contracts', () => {
  test('serves the index plus essential and full transcript tiers', async () => {
    const listResponse = await handle('/api/v1/open-science/use-cases')
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    expect(listBody.code).toBe(20000)
    expect(Array.isArray(listBody.data)).toBe(true)
    expect(listBody.data.length).toBeGreaterThan(0)

    const slug = listBody.data[0].slug
    const essentialResponse = await handle(`/api/v1/open-science/use-cases/${slug}/transcript`)
    expect(essentialResponse.status).toBe(200)
    const essential = await essentialResponse.json()
    expect(essential.data.slug).toBe(slug)
    expect(essential.data.schemaVersion).toBe(1)

    const fullResponse = await handle(`/api/v1/open-science/use-cases/${slug}/transcript/full`)
    expect(fullResponse.status).toBe(200)
    const full = await fullResponse.json()
    expect(full.data.slug).toBe(slug)
    // The full tier carries at least as many assets as the essential tier.
    expect(Object.keys(full.data.assets).length).toBeGreaterThanOrEqual(
      Object.keys(essential.data.assets).length
    )
  })

  test('returns the 404 envelope for unknown slugs', async () => {
    const response = await handle('/api/v1/open-science/use-cases/no-such-case/transcript')
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.data).toBeNull()
  })
})
