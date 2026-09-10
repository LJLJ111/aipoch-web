/**
 * Daily, weekly, and monthly leaderboards: client-side visibility and server-side GET requests for period data.
 */

import { isAxiosError } from 'axios'
import { INTERNAL_API_URL } from '@/lib/config'
import type { API } from '@/service/types'
import { apiClient } from './index'

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly'

/** GET /v1/leaderboards/visibility — data */
export interface PeriodLeaderboardVisibility {
  daily: boolean
  weekly: boolean
  monthly: boolean
}

/** A data.items entry from GET /v1/leaderboards/{type}. */
export interface PeriodLeaderboardApiItem {
  rank: number
  skill_name: string
  skill_title?: string | null
  category: string
  author: string
  total_score: number
  core_score: number
  medical_score: number
  result_path?: string | null
}

/** GET /v1/leaderboards/{type} — data.stats */
export interface PeriodLeaderboardStatsApi {
  total_count: number
  max_score: number | null
  avg_score: number | null
}

/** GET /v1/leaderboards/{type} — data */
export interface PeriodLeaderboardResponseData {
  type: string
  is_visible: boolean
  stats: PeriodLeaderboardStatsApi
  items: PeriodLeaderboardApiItem[]
}

export type PeriodLeaderboardData = PeriodLeaderboardResponseData

type PeriodLeaderboardResponse = API.GeneralResponse<PeriodLeaderboardResponseData>
type PeriodLeaderboardVisibilityResponse = API.GeneralResponse<PeriodLeaderboardVisibility>

/** React Query: only visibility is still fetched on the client. */
export const leaderboardPeriodKeys = {
  all: ['leaderboard', 'period'] as const,
  visibility: () => [...leaderboardPeriodKeys.all, 'visibility'] as const
}

/**
 * Server periodic leaderboard list: GET /v1/leaderboards/{leaderboard_type}.
 * @returns `null` for HTTP 404; the period page redirects to the overall `/leaderboard`.
 */
export async function fetchPeriodLeaderboard(
  leaderboardType: LeaderboardPeriod
): Promise<PeriodLeaderboardData | null> {
  const base = INTERNAL_API_URL.replace(/\/$/, '')
  const url = `${base}/v1/leaderboards/${leaderboardType}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  })
  if (res.status === 404) {
    return null
  }
  if (!res.ok) {
    throw new Error(`Leaderboard request failed: ${res.status}`)
  }
  const json: PeriodLeaderboardResponse = await res.json()
  return json.data
}

/**
 * Client request: GET /v1/leaderboards/visibility.
 */
export async function fetchPeriodLeaderboardVisibility(): Promise<PeriodLeaderboardVisibility> {
  try {
    const response = await apiClient.get<PeriodLeaderboardVisibilityResponse>('/v1/leaderboards/visibility')
    return response.data.data
  } catch (e) {
    if (isAxiosError(e)) {
      const msg =
        e.response?.data && typeof e.response.data === 'object' && 'msg' in e.response.data
          ? String((e.response.data as { msg?: string }).msg)
          : e.message
      throw new Error(msg || 'Failed to load leaderboard visibility')
    }
    throw e
  }
}
