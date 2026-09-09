import type { LeaderboardBreadcrumb } from '@/app/(commonLayout)/leaderboard/items/[slug]/components/build-leaderboard-eval-props'
import { INTERNAL_API_URL } from '@/lib/config'

/** Data returned by GET `/v1/leaderboards/results/{result_path}`. */
export interface LeaderboardResultDetailData {
  raw_result_json: unknown
  breadcrumb?: LeaderboardBreadcrumb
}

export interface LeaderboardResultDetailEnvelope {
  code: number
  msg: string
  data: LeaderboardResultDetailData
}

/** `result_path` is the evaluation path used as the slug in `/leaderboard/items/[slug]`. */
export async function fetchLeaderboardResultDetail(
  resultPath: string
): Promise<LeaderboardResultDetailEnvelope> {
  const base = INTERNAL_API_URL.replace(/\/$/, '')
  const url = `${base}/v1/leaderboards/results/${encodeURIComponent(resultPath)}`

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch leaderboard result: ${res.status} — ${url}`
    )
  }

  return res.json()
}
