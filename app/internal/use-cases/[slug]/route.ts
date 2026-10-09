import { fetchUseCaseDetail } from '@/service/open-science-use-cases.server'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const headers = { 'Cache-Control': 'no-store' }
  try {
    const { slug } = await context.params
    const entry = await fetchUseCaseDetail(slug)
    if (!entry?.package)
      return Response.json({ error: 'Research package not found.' }, { status: 404, headers })
    return Response.json(entry.package, { headers })
  } catch (error) {
    console.error('[use-case-package] metadata.failed', error)
    return Response.json(
      { error: 'Package information is temporarily unavailable.' },
      { status: 503, headers }
    )
  }
}
