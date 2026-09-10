import type { Metadata } from 'next'
import { notFound, unstable_rethrow } from 'next/navigation'
import { buildLeaderboardEvalProps } from './components/build-leaderboard-eval-props'
import type { LeaderboardBreadcrumb } from './components/build-leaderboard-eval-props'
import type { LeaderboardEvaluationPayload } from './components/leaderboard-evaluation'
import { normalizeLeaderboardRawResult } from './components/normalize-leaderboard-raw-result'
import { fetchLeaderboardResultDetail } from '@/service/leaderboard-results'
import { LeaderboardEvalView } from './components/leaderboard-eval-view'

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
    const loaded = await loadLeaderboardPageData(slug)
    if (!loaded) {
      return { title: 'Evaluation | AIPOCH' }
    }
    const { data } = loaded
    return {
      title: `${data.meta.skill_name} — Evaluation Results | AIPOCH`,
      description:
        data.meta.skill_description ?? `Evaluation results for ${data.meta.skill_name}.`
    }
  } catch {
    return { title: 'Evaluation | AIPOCH' }
  }
}

export default async function LeaderboardPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
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
