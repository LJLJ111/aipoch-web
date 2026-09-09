import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { INTERNAL_API_URL } from '@/lib/config'
import type { API } from '@/service/types'
import { apiClient } from './index'

// Category type definition.
export interface Category {
  id: string
  name: string
}

export interface CategoryListResponse {
  items: Category[]
}

// Skill type definition.
export interface CategoryItem {
  id: string
  name: string
}

export interface TagItem {
  id: string
  name: string
}

export interface Skill {
  id: string
  name: string
  path: string
  title: string
  description: string
  categories: CategoryItem[] | string[]
  tags: TagItem[] | string[]
  icon: string
  author: {
    name: string
    avatar_url: string
    org: string
  }
  stats: {
    views: number
    downloads: number
  }
  updated_at: string
  score?: number | null
}

// Statistics type definition.
export interface TotalCountResponse {
  total_skills: number
  total_authors: number
}

/** A `static_categories` entry. */
export interface SkillScoreStaticCategory {
  key: string
  label: string
  score?: number
  max?: number
}

/** A `score_detail.dynamic_score.inputs` entry. */
export interface SkillScoreDynamicInputSummary {
  index: number
  type?: string
  label?: string
  score?: number
  assertions_passed?: number
  assertions_total?: number
  status?: string
  status_flag?: string
  note?: string
  basic?: number
  specialized?: number
  assertions?: Array<{ text?: string; result?: string; note?: string }>
}

/** score_detail.dynamic_score.assertion_pass_rate */
export interface SkillScoreAssertionPassRate {
  passed?: number
  total?: number
}

/** score_detail.dynamic_score */
export interface SkillScoreDynamicScoreBlock {
  execution_avg?: number
  max?: number
  assertion_pass_rate?: SkillScoreAssertionPassRate
  inputs?: SkillScoreDynamicInputSummary[]
}

/** `score_detail` from the skill detail response. */
export interface ScoreDetail {
  score: number
  max: number
  grade?: string
  deployable?: boolean
  grade_symbol?: string
  veto_override?: boolean
  static_score_total?: number
  static_score_max?: number
  static_categories?: SkillScoreStaticCategory[]
  dynamic_score?: SkillScoreDynamicScoreBlock | null
  evaluation_report_url?: string | null
  /** Leaderboard detail path segment in kebab-case, such as skill-rank-result. */
  leaderboard_slug?: string | null
}

export interface SkillDetail extends Skill {
  version: string
  published_at: string
  changelog: string
  skill_md: string
  manifest: Record<string, unknown>
  storage_provider: string
  zip_uri: string
  zip_size: number
  zip_sha256: string
  github_repo_url: string | null
  github_release_download_url: string | null
  license: string
  content_language: string
  /** Show the evaluation section when this value is present. */
  score_detail?: ScoreDetail | null
  /** Full evaluation results link, at the same level as `score_detail`. */
  score_result_url?: string | null
}

export interface SkillListResponse {
  items: Skill[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// Fetch the category list.
export async function fetchCategories(): Promise<CategoryListResponse> {
  const response = await apiClient.get<ApiResponse<CategoryListResponse>>('/v1/skills/categories', {
    params: {
      page: 1,
      page_size: 100 // Fetch all categories in one page.
    }
  })
  return response.data.data
}

// Query key factory.
export const categoriesKeys = {
  all: ['categories'] as const,
  list: () => [...categoriesKeys.all, 'list'] as const
}

// Skills query key factory.
export const skillsKeys = {
  all: ['skills'] as const,
  list: (filters: {
    category_id?: string
    search?: string
    order_by?: SkillsOrderBy
    order_direction?: SkillsOrderDirection
  }) =>
    [...skillsKeys.all, 'list', filters] as const
}

// Fetch categories with React Query.
export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.list(),
    queryFn: fetchCategories,
    retryDelay: 500
  })
}

export type SkillsOrderBy = 'view_count' | 'download_count' | 'score'

export type SkillsOrderDirection = 'asc' | 'desc'

// Skills API parameters.
export interface FetchSkillsParams {
  page: number
  page_size: number
  category_id?: string
  search?: string
  order_by?: SkillsOrderBy
  order_direction?: SkillsOrderDirection
}

// Fetch the skill list.
export async function fetchSkills(params: FetchSkillsParams): Promise<SkillListResponse> {
  const response = await apiClient.get<ApiResponse<SkillListResponse>>('/v1/skills', { params })
  if (!response.data?.data) {
    throw new Error('Skills list response is empty.')
  }
  return response.data.data
}

// Fetch skill details on the server with native fetch so the client-only apiClient does not lose baseURL during SSR.
export async function fetchSkillDetail(skillPath: string): Promise<SkillDetail> {
  const res = await fetch(
    `${INTERNAL_API_URL}/v1/skills/${encodeURIComponent(skillPath)}?count_view=true`,
    {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch skill detail: ${res.status}`)
  }
  const payload = (await res.json()) as ApiResponse<SkillDetail>
  return payload.data
}

/**
 * Fetch skills on the server for SSR, structured data, and similar uses.
 * Use native fetch to avoid losing apiClient's baseURL on the server.
 */
export async function fetchSkillsForServer(
  params: FetchSkillsParams = { page: 1, page_size: 20 }
): Promise<SkillListResponse | null> {
  try {
    const searchParams = new URLSearchParams({
      page: String(params.page),
      page_size: String(params.page_size),
      order_by: params.order_by ?? 'view_count',
      order_direction: params.order_direction ?? 'desc'
    })
    if (params.category_id) searchParams.set('category_id', params.category_id)
    if (params.search) searchParams.set('search', params.search)

    const res = await fetch(`${INTERNAL_API_URL}/v1/skills?${searchParams}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    if (!res.ok) return null
    const data = (await res.json()) as ApiResponse<SkillListResponse>
    return data.data
  } catch {
    return null
  }
}

// Fetch skills with React Query Infinite Query, including caching and scroll restoration.
export function useInfiniteSkills(
  category_id: string | undefined,
  search: string | undefined,
  page_size: number = 9,
  order_by: SkillsOrderBy = 'view_count',
  order_direction: SkillsOrderDirection = 'desc'
) {
  return useInfiniteQuery({
    queryKey: skillsKeys.list({ category_id, search, order_by, order_direction }),
    queryFn: async ({ pageParam = 1 }) => {
      return fetchSkills({
        page: pageParam,
        page_size,
        category_id,
        search,
        order_by,
        order_direction
      })
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) {
        return undefined
      }
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh for 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes - keep cache for 10 minutes
  })
}

// Fetch statistics: total skills and authors.
export async function fetchTotalCount(): Promise<ApiResponse<TotalCountResponse>> {
  const response = await apiClient.get<ApiResponse<TotalCountResponse>>('/v1/skills/total_count')
  return response.data
}

// Total count query key factory.
export const totalCountKeys = {
  all: ['totalCount'] as const,
  stats: () => [...totalCountKeys.all, 'stats'] as const
}

// Fetch statistics with React Query.
export function useTotalCount() {
  return useQuery({
    queryKey: totalCountKeys.stats(),
    queryFn: fetchTotalCount,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  })
}

export interface GithubDownloadData {
  download_url: string
}

/**
 * Fetch a GitHub Release download URL; the backend increments the count on a successful response.
 * GET /v1/skills/{skill_path}/github_download
 */
export async function fetchGithubDownloadUrl(
  skillPath: string
): Promise<API.GeneralResponse<GithubDownloadData> | API.ErrorResponse> {
  try {
    const response = await apiClient.get<ApiResponse<GithubDownloadData>>(
      `/v1/skills/${encodeURIComponent(skillPath)}/github_download`
    )

    return { code: response.status, msg: response.data.msg, data: response.data.data }
  } catch (error) {
    if (isAxiosError(error)) {
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Failed to get GitHub download link.',
        data: null
      }
    }
    return { code: 500, msg: 'Failed to get GitHub download link.', data: null }
  }
}

