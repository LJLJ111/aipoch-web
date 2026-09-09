import { INTERNAL_API_URL } from '@/lib/config'
import type { API } from '@/service/types'

export interface CompareSeoPayload {
  title: string | null
  h1: string | null
  description: string | null
  keywords: string[]
}

export interface CompareSkillDetail {
  rank_skill_id: number
  skill_name: string
  skill_title: string | null
  skill_description: string | null
  category: string
  skill_author: string
  total_score: number | null
  raw_result_json: unknown
}

export interface CompareDetailData {
  path: string
  left_skill: CompareSkillDetail
  right_skill: CompareSkillDetail
  seo: CompareSeoPayload | null
}

/** Fetch public Compare details. Treat unsuccessful HTTP responses as unrenderable so the page can return 404. */
export async function fetchCompareDetail(path: string): Promise<CompareDetailData | null> {
  try {
    const base = INTERNAL_API_URL.replace(/\/$/, '')
    const url = `${base}/v1/compare/${encodeURIComponent(path)}`

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (res.status !== 200) return null

    const json: API.GeneralResponse<CompareDetailData> = await res.json()
    return json.data
  } catch {
    return null
  }
}
