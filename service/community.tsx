import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { INTERNAL_API_URL } from '@/lib/config'
import { apiClient } from './index'

// --- Types ---

export interface PostAuthor {
  id: number
  username: string
  x_handle: string
  display_name: string
  avatar_url: string | null
}

export interface PostItem {
  id: number
  title: string
  author: PostAuthor
  score: number
  comment_count: number
  view_count: number
  created_at: string
}

export interface PostListResponse {
  items: PostItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PostDetail {
  id: number
  title: string
  content: string
  author: PostAuthor
  status: string
  view_count: number
  comment_count: number
  upvote_count: number
  downvote_count: number
  score: number
  created_at: string
  updated_at: string
  user_vote: string | null
}

export interface CommentItem {
  id: number
  post_id: number
  content: string
  author: PostAuthor
  parent_id: number | null
  root_id: number | null
  depth: number
  upvote_count: number
  downvote_count: number
  score: number
  created_at: string
  user_vote: string | null
  children: CommentItem[]
}

export interface CommentListResponse {
  items: CommentItem[]
  total?: number
  page?: number
  page_size?: number
  total_pages?: number
}

export type PostSortType = 'top' | 'new' | 'hot' | 'shuffle'

// --- API Params ---

export interface FetchPostsParams {
  sort?: PostSortType
  page?: number
  page_size?: number
  search?: string
}

// --- API Functions ---

export async function fetchPosts(params?: FetchPostsParams): Promise<PostListResponse> {
  const response = await apiClient.get('/v1/posts', { params })
  return (
    response.data.data ?? {
      items: [],
      total: 0,
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 20,
      total_pages: 0
    }
  )
}

// Client-side request.
export async function fetchPostDetail(id: number | string): Promise<PostDetail> {
  const response = await apiClient.get(`/v1/posts/${id}`)
  return response.data.data
}

// Server-side request for SSR.
export async function fetchPostDetailServer(id: number | string): Promise<PostDetail> {
  const res = await fetch(`${INTERNAL_API_URL}/v1/posts/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch post detail: ${res.status}`)
  }
  const data = await res.json()
  return data.data
}

export interface FetchCommentsParams {
  page?: number
  page_size?: number
}

export async function fetchPostComments(
  id: number | string,
  params?: FetchCommentsParams
): Promise<CommentListResponse> {
  const response = await apiClient.get(`/v1/posts/${id}/comments`, { params })
  return response.data.data
}

// --- Query Keys ---

export const communityKeys = {
  all: ['community'] as const,
  posts: () => [...communityKeys.all, 'posts'] as const,
  postList: (params?: FetchPostsParams) => [...communityKeys.posts(), params] as const,
  postDetail: (id: number | string) => [...communityKeys.all, 'post', id] as const,
  comments: (postId: number | string) => [...communityKeys.all, 'comments', postId] as const
}

// --- React Query Hooks ---

export function usePosts(params?: FetchPostsParams) {
  return useQuery({
    queryKey: communityKeys.postList(params),
    queryFn: () => fetchPosts(params)
  })
}

export function useInfinitePostList(
  sort: PostSortType,
  search?: string,
  pageSize = 20,
  seed?: number
) {
  return useInfiniteQuery<PostListResponse>({
    queryKey: [...communityKeys.posts(), 'infinite', sort, seed, search, pageSize],
    queryFn: ({ pageParam }) =>
      fetchPosts({
        sort,
        page: pageParam as number,
        page_size: pageSize,
        search: search || undefined
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData
  })
}

export function usePostDetail(id: number | string) {
  return useQuery({
    queryKey: communityKeys.postDetail(id),
    queryFn: () => fetchPostDetail(id),
    enabled: !!id
  })
}

export function usePostComments(postId: number | string) {
  return useQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: () => fetchPostComments(postId),
    enabled: !!postId
  })
}

export function useInfinitePostComments(postId: number | string, pageSize = 20) {
  return useInfiniteQuery<CommentListResponse>({
    queryKey: [...communityKeys.comments(postId), 'infinite', pageSize],
    queryFn: ({ pageParam }) =>
      fetchPostComments(postId, {
        page: pageParam as number,
        page_size: pageSize
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.flatMap((p) => p.items).length

      // Use total to determine pagination when the API provides it.
      if (lastPage.total !== undefined) {
        if (loadedCount < lastPage.total) {
          return (lastPage.page ?? allPages.length) + 1
        }
        return undefined
      }

      return undefined
    }
  })
}
