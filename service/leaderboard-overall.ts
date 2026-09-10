import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { INTERNAL_API_URL } from '@/lib/config'
import type { API } from '@/service/types'
import { apiClient } from './index'

/** Overall leaderboard page size, matching the API's page_size parameter. */
export const LEADERBOARD_PAGE_SIZE = 20

/** List item from GET /v1/leaderboards/overall. */
export interface OverallLeaderboardItem {
  rank: number
  skill_name: string
  skill_title?: string
  display_name?: string
  category: string
  author: string
  total_score: number
  core_score: number
  medical_score: number
  result_path?: string | null
  local_skill_slug?: string | null
  stats?: {
    views: number
    downloads: number
  }
  local_skill_id?: string | null
  skill_exists_in_local_library?: boolean
}

/** Display name priority: skill_title, then display_name, then skill_name. */
export function getLeaderboardSkillDisplayName(item: OverallLeaderboardItem): string {
  const t = item.skill_title?.trim()
  if (t) return t
  const d = item.display_name?.trim()
  if (d) return d
  return item.skill_name
}

export interface OverallLeaderboardPagination {
  page: number
  page_size: number
  total_count: number
  total_pages: number
}

export interface OverallLeaderboardData {
  items: OverallLeaderboardItem[]
  pagination: OverallLeaderboardPagination
}

/** GET /v1/skills/categories, used only for leaderboard filtering. */
export interface LeaderboardCategoryItem {
  id: string
  name: string
}

export interface LeaderboardCategoriesData {
  items: LeaderboardCategoryItem[]
}

type LeaderboardCategoriesPayload = LeaderboardCategoriesData & {
  total?: number
  page?: number
  page_size?: number
  total_pages?: number
}

/**
 * Client category list: GET /v1/skills/categories?page=1&page_size=100.
 * Fetch through apiClient when the filter panel opens; return the standard envelope with null data on failure.
 */
export async function fetchLeaderboardCategoriesClient(): Promise<
  API.GeneralResponse<LeaderboardCategoriesData> | API.ErrorResponse
> {
  try {
    const response = await apiClient.get<API.GeneralResponse<LeaderboardCategoriesPayload>>(
      '/v1/skills/categories',
      {
        params: { page: 1, page_size: 100 }
      }
    )
    return {
      code: 200,
      msg: 'Success',
      data: {
        items: response.data.data?.items ?? []
      }
    }
  } catch (e) {
    if (isAxiosError(e)) {
      const res = e.response
      return {
        code: res?.status || 500,
        msg: res?.data?.msg || 'Internal Server Error, please try again later.',
        data: null
      }
    }
    return {
      code: 500,
      msg: 'Internal Server Error, please try again later.',
      data: null
    }
  }
}

/**
 * Server category list: GET /v1/skills/categories?page=1&page_size=100.
 */
export async function fetchLeaderboardCategories(): Promise<LeaderboardCategoriesData> {
  const base = INTERNAL_API_URL.replace(/\/$/, '')
  const url = `${base}/v1/skills/categories?page=1&page_size=100`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error(`Leaderboard categories request failed: ${res.status}`)
  }
  const json: API.GeneralResponse<LeaderboardCategoriesPayload> = await res.json()
  return {
    items: json.data?.items ?? []
  }
}

/** React Query cache key for leaderboard categories. */
export const leaderboardCategoriesKeys = {
  all: ['leaderboard', 'categories'] as const,
  list: () => [...leaderboardCategoriesKeys.all, 'list'] as const
}

/** Data shape returned by GET /v1/leaderboards/overall/stats. */
export interface OverallLeaderboardStatsData {
  total_count?: number
  evaluated_skills?: number
  max_score?: number
  min_score?: number
  avg_total_score?: number
  avg_core_score?: number
  avg_medical_score?: number
  max_score_skill?: string | null
}

/** Serialize query parameters, omitting empty values. */
function paramsToSearchParams(params: Record<string, string | number>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    sp.set(k, String(v))
  }
  return sp.toString()
}

/**
 * Client overall leaderboard list: GET /v1/leaderboards/overall.
 */
export async function fetchOverallLeaderboardClient(
  params: Record<string, string | number>
): Promise<API.GeneralResponse<OverallLeaderboardData> | API.ErrorResponse> {
  try {
    const qs = paramsToSearchParams(params)
    const response = await apiClient.get<API.GeneralResponse<OverallLeaderboardData>>(
      '/v1/leaderboards/overall' + (qs ? `?${qs}` : '')
    )
    return {
      code: 200,
      msg: response.data.msg,
      data: response.data.data
    }
  } catch (e) {
    if (isAxiosError(e)) {
      const res = e.response
      return {
        code: res?.status || 500,
        msg: res?.data?.msg || 'Internal Server Error, please try again later.',
        data: null
      }
    }
    return {
      code: 500,
      msg: 'Internal Server Error, please try again later.',
      data: null
    }
  }
}

/**
 * Server overall leaderboard list: GET /v1/leaderboards/overall.
 */
export async function fetchOverallLeaderboard(
  params: Record<string, string | number>
): Promise<OverallLeaderboardData> {
  const qs = paramsToSearchParams(params)
  const base = INTERNAL_API_URL.replace(/\/$/, '')
  const url = `${base}/v1/leaderboards/overall` + (qs ? `?${qs}` : '')
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error(`Leaderboard request failed: ${res.status}`)
  }
  const json: API.GeneralResponse<OverallLeaderboardData> = await res.json()
  return json.data
}

/**
 * Server overall leaderboard statistics: GET /v1/leaderboards/overall/stats.
 */
export async function fetchOverallLeaderboardStats(): Promise<OverallLeaderboardStatsData> {
  const base = INTERNAL_API_URL.replace(/\/$/, '')
  const url = `${base}/v1/leaderboards/overall/stats`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error(`Leaderboard stats request failed: ${res.status}`)
  }
  const json: API.GeneralResponse<OverallLeaderboardStatsData> = await res.json()
  return json.data
}

export async function fetchOverallLeaderboardStatsServer(): Promise<OverallLeaderboardStatsData> {
  return fetchOverallLeaderboardStats()
}

export async function fetchOverallLeaderboardServer(
  params: Record<string, string | number>
): Promise<OverallLeaderboardData> {
  return fetchOverallLeaderboard(params)
}

/** Parse range strings from the filter panel into numeric parameters, skipping empty strings. */
function appendRange(
  params: Record<string, string | number>,
  key: string,
  raw: string,
  parser: (s: string) => number | undefined
) {
  const v = raw.trim()
  if (v === '') return
  const n = parser(v)
  if (n !== undefined && !Number.isNaN(n)) params[key] = n
}

/** Encode filter state and the page number as API query parameters. */
export function buildOverallLeaderboardParams(input: {
  keyword: string
  categoryApiValue: string | null
  rankMin: string
  rankMax: string
  scoreMin: string
  scoreMax: string
  coreMin: string
  coreMax: string
  medMin: string
  medMax: string
  page: number
  pageSize: number
}): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: input.page,
    page_size: input.pageSize
  }
  const kw = input.keyword.trim()
  if (kw) params.keyword = kw
  if (input.categoryApiValue) params.category = input.categoryApiValue

  appendRange(params, 'rank_min', input.rankMin, (s) => parseInt(s, 10))
  appendRange(params, 'rank_max', input.rankMax, (s) => parseInt(s, 10))
  appendRange(params, 'score_min', input.scoreMin, (s) => parseFloat(s))
  appendRange(params, 'score_max', input.scoreMax, (s) => parseFloat(s))
  appendRange(params, 'core_min', input.coreMin, (s) => parseFloat(s))
  appendRange(params, 'core_max', input.coreMax, (s) => parseFloat(s))
  appendRange(params, 'medical_min', input.medMin, (s) => parseFloat(s))
  appendRange(params, 'medical_max', input.medMax, (s) => parseFloat(s))

  return params
}

export type LeaderboardInfiniteFilters = {
  keyword: string
  categoryApiValue: string | null
  rankMin: string
  rankMax: string
  scoreMin: string
  scoreMax: string
  coreMin: string
  coreMax: string
  medMin: string
  medMax: string
}

/** Defaults when no filters are active. */
export const DEFAULT_LEADERBOARD_FILTERS: LeaderboardInfiniteFilters = {
  keyword: '',
  categoryApiValue: null,
  rankMin: '',
  rankMax: '',
  scoreMin: '',
  scoreMax: '',
  coreMin: '',
  coreMax: '',
  medMin: '',
  medMax: ''
}

/** Check for default filters before seeding the infinite query with first-page data. */
export function isDefaultLeaderboardFilters(f: LeaderboardInfiniteFilters): boolean {
  return (
    f.keyword.trim() === '' &&
    (f.categoryApiValue ?? null) === null &&
    f.rankMin === '' &&
    f.rankMax === '' &&
    f.scoreMin === '' &&
    f.scoreMax === '' &&
    f.coreMin === '' &&
    f.coreMax === '' &&
    f.medMin === '' &&
    f.medMax === ''
  )
}

/** React Query cache key for the overall leaderboard infinite query, updated when filters change. */
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  infinite: (f: LeaderboardInfiniteFilters) =>
    [
      ...leaderboardKeys.all,
      'infinite',
      f.keyword,
      f.categoryApiValue ?? '',
      f.rankMin,
      f.rankMax,
      f.scoreMin,
      f.scoreMax,
      f.coreMin,
      f.coreMax,
      f.medMin,
      f.medMax
    ] as const
}

export function useInfiniteOverallLeaderboard(
  filters: LeaderboardInfiniteFilters,
  initialPageData?: OverallLeaderboardData | null
) {
  return useInfiniteQuery({
    queryKey: leaderboardKeys.infinite(filters),
    queryFn: async ({ pageParam }) => {
      const result = await fetchOverallLeaderboardClient(
        buildOverallLeaderboardParams({
          ...filters,
          page: pageParam as number,
          pageSize: LEADERBOARD_PAGE_SIZE
        })
      )
      if (result.data === null) {
        throw new Error(result.msg)
      }
      return result.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.total_pages
        ? lastPage.pagination.page + 1
        : undefined,
    placeholderData: keepPreviousData,
    initialData:
      initialPageData && isDefaultLeaderboardFilters(filters)
        ? { pages: [initialPageData], pageParams: [1] }
        : undefined
  })
}
