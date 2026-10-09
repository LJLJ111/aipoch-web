import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchUseCaseDetail } from '@/service/open-science-use-cases.server'
import { ReplayView } from '../../_components/replay-view'

type PageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

// Only metadata is server-rendered; the browser downloads and parses the package.
export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params
  // A catalog outage must not block the client loading UI or its error state.
  const useCase = await fetchUseCaseDetail(id).catch(() => null)
  if (!useCase) return {}
  return createPageMetadata({
    title: `Replay: ${useCase.title} | Open-Science Use Cases`,
    description:
      useCase.description ??
      `Read-only replay of the exported Open-Science session "${useCase.title}".`,
    canonical: `${SITE_DOMAIN}/open-science/use-cases/${encodeURIComponent(useCase.slug)}/replay`
  })
}

export default async function OpenScienceUseCaseReplayPage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={null}>
      <ReplayView slug={id} />
    </Suspense>
  )
}
