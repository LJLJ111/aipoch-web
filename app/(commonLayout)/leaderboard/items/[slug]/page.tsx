import type { Metadata } from 'next'
import { notFound, unstable_rethrow } from 'next/navigation'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { fetchLeaderboardResultDetail } from '@/service/leaderboard-results'
import type { LeaderboardBreadcrumb } from './components/build-leaderboard-eval-props'
import { buildLeaderboardEvalProps } from './components/build-leaderboard-eval-props'
import { LeaderboardEvalView } from './components/leaderboard-eval-view'
import type { LeaderboardEvaluationPayload } from './components/leaderboard-evaluation'
import { normalizeLeaderboardRawResult } from './components/normalize-leaderboard-raw-result'

type LeaderboardPageData = {
  data: LeaderboardEvaluationPayload
  breadcrumb?: LeaderboardBreadcrumb
}

async function loadLeaderboardPageData(slug: string): Promise<LeaderboardPageData | null> {
  try {
    const envelope = await fetchLeaderboardResultDetail(slug)

    const raw = envelope.data?.raw_result_json
    const data = normalizeLeaderboardRawResult(raw)
    if (!data) {
      return null
    }

    const breadcrumb: LeaderboardBreadcrumb | undefined = envelope.data?.breadcrumb
    return { data, breadcrumb }
  } catch {
    return null
  }
}

async function loadPayload(slug: string): Promise<LeaderboardPageData> {
  const loaded = await loadLeaderboardPageData(slug)
  if (!loaded) notFound()
  return loaded
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const canonical = `${SITE_DOMAIN}/leaderboard/items/${slug}`
    const loaded = await loadLeaderboardPageData(slug)
    if (!loaded) {
      return {
        ...createPageMetadata({
          title: 'Evaluation | AIPOCH',
          description: 'AIPOCH medical research skill evaluation results.',
          canonical
        }),
        robots: { index: false, follow: false }
      }
    }
    const { data } = loaded
    return createPageMetadata({
      title: `${data.meta.skill_name} — Evaluation Results | AIPOCH`,
      description:
        data.meta.description?.trim() ||
        data.meta.skill_description?.trim() ||
        `Evaluation results for ${data.meta.skill_name}.`,
      canonical
    })
  } catch {
    return {
      title: 'Evaluation | AIPOCH',
      robots: { index: false, follow: false }
    }
  }
}

export default async function LeaderboardPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { data, breadcrumb } = await loadPayload(slug)
    const props = buildLeaderboardEvalProps(data, slug, { breadcrumb })
    return <LeaderboardEvalView {...props} />
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }
}
