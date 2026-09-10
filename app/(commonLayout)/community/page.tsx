'use client'

import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useEventListener, useSize } from 'ahooks'
import {
  ChevronDown,
  ChevronUp,
  Flame,
  LoaderCircle,
  MessageSquare,
  Search,
  Shuffle,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  communityKeys,
  type PostListResponse,
  type PostSortType,
  useInfinitePostList
} from '@/service/community'
import { PostSkeleton } from './components/post-skeleton'

function timeAgo(dateStr: string): string {
  const now = new Date()
  const normalized = dateStr.replace(/(\.\d{3})\d+/, '$1')
  const date = new Date(normalized + (normalized.endsWith('Z') ? '' : 'Z'))
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const FILTERS: { label: string; value: PostSortType; icon: typeof Flame }[] = [
  { label: 'Shuffle', value: 'shuffle', icon: Shuffle },
  { label: 'Hot', value: 'hot', icon: Flame },
  { label: 'New', value: 'new', icon: Sparkles },
  { label: 'Top', value: 'top', icon: TrendingUp }
]

const VALID_SORTS: PostSortType[] = ['shuffle', 'hot', 'new', 'top']

export default function CommunityPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const initSort = searchParams.get('sort') as PostSortType
  const initQ = searchParams.get('q') || ''

  const [activeFilter, setActiveFilter] = useState<PostSortType>(
    VALID_SORTS.includes(initSort) ? initSort : 'hot'
  )
  const [searchInput, setSearchInput] = useState(initQ)
  const [search, setSearch] = useState(initQ)
  const [shuffleSeed, setShuffleSeed] = useState(() => {
    if (typeof window !== 'undefined') {
      const state = window.history.state as { seed?: number; sort?: string } | null
      if (state?.seed !== undefined && state?.sort === 'shuffle') {
        return state.seed
      }
    }
    return Math.random()
  })

  // Track if we're switching filters to show skeleton only when no cache
  const [isSwitchingFilter, setIsSwitchingFilter] = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<PostSortType, HTMLButtonElement | null>>({
    shuffle: null,
    hot: null,
    new: null,
    top: null
  })
  const [sliderStyle, setSliderStyle] = useState({ left: '6px', width: '0px', opacity: 0 })

  const updateSliderPosition = useCallback(() => {
    const activeButton = buttonRefs.current[activeFilter]
    const container = filterRef.current
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      setSliderStyle({
        left: `${buttonRect.left - containerRect.left}px`,
        width: `${buttonRect.width}px`,
        opacity: 1
      })
    }
  }, [activeFilter])

  useEffect(() => {
    if (activeFilter === 'shuffle' && typeof window !== 'undefined') {
      const state = window.history.state || {}
      window.history.replaceState({ ...state, seed: shuffleSeed, sort: 'shuffle' }, '')
    }
  }, [shuffleSeed, activeFilter])

  const activeButtonSize = useSize(buttonRefs.current[activeFilter])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <IT IS NECESSARY!>
  useEffect(() => {
    updateSliderPosition()
  }, [activeButtonSize, updateSliderPosition])

  useEventListener('visibilitychange', () => {
    if (!document.hidden) {
      requestAnimationFrame(() => {
        updateSliderPosition()
      })
    }
  })

  const updateURL = useCallback(
    (sort: PostSortType, q: string) => {
      const params = new URLSearchParams()
      if (sort !== 'hot') params.set('sort', sort)
      if (q) params.set('q', q)
      const qs = params.toString()
      router.replace(`/community${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [router]
  )

  const clearSearch = useCallback(() => {
    setSearchInput('')
    setSearch('')
    updateURL(activeFilter, '')
  }, [activeFilter, updateURL])

  const handleReshuffle = useCallback(() => {
    // Generate new seed to trigger data fetch
    // keepPreviousData will keep showing old data until new data loads
    const newSeed = Math.random()
    setShuffleSeed(newSeed)
    // Note: scroll position is kept default (no manual manipulation)
  }, [])

  useEffect(() => {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const isReload = navEntries.length > 0 && navEntries[0].type === 'reload'
    if (isReload) {
      window.scrollTo(0, 0)
    } else {
      const savedPosition = sessionStorage.getItem('community_scroll_position')
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10))
      }
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('community_scroll_position', window.scrollY.toString())
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      sessionStorage.setItem('community_scroll_position', window.scrollY.toString())
    }
  }, [])

  // Check if target filter has cached data
  // Note: shuffle always returns false to reload data on every click (design requirement)
  const hasCacheForFilter = useCallback(
    (targetSort: PostSortType) => {
      // Shuffle always reloads, no cache check
      if (targetSort === 'shuffle') return false

      const key = [...communityKeys.posts(), 'infinite', targetSort, undefined, search, 20]
      const data = queryClient.getQueryData<{
        pages: PostListResponse[]
        pageParams: number[]
      }>(key)
      return data && data.pages.length > 0 && data.pages[0].items.length > 0
    },
    [queryClient, search]
  )

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useInfinitePostList(
      activeFilter,
      search,
      20,
      activeFilter === 'shuffle' ? shuffleSeed : undefined
    )

  const posts = data?.pages.flatMap((page) => page.items) ?? []

  // Reset switching state when data is loaded
  useEffect(() => {
    if (!isFetching && isSwitchingFilter) {
      setIsSwitchingFilter(false)
    }
  }, [isFetching, isSwitchingFilter])

  const handleFilterClick = useCallback(
    (value: PostSortType) => {
      if (isFetching) return

      if (value === 'shuffle') {
        const newSeed = Math.random()
        if (activeFilter === 'shuffle') {
          setShuffleSeed(newSeed)
        } else {
          setIsSwitchingFilter(true)
          setActiveFilter('shuffle')
          setShuffleSeed(newSeed)
        }
        updateURL('shuffle', search)
      } else {
        const hasCache = hasCacheForFilter(value)
        if (!hasCache) {
          setIsSwitchingFilter(true)
        }
        setActiveFilter(value)
        updateURL(value, search)
      }
    },
    [isFetching, activeFilter, search, hasCacheForFilter, updateURL]
  )

  // Determine if we should show skeleton:
  // 1. Initial load (isLoading && no posts)
  // 2. Switching to a filter without cache (shuffle always shows skeleton)
  const shouldShowSkeleton =
    (isLoading && posts.length === 0) || (isSwitchingFilter && !hasCacheForFilter(activeFilter))

  return (
    <div className="bg-bg-light dark:bg-bg-dark min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-4">
            <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
              <div
                ref={filterRef}
                className="relative flex items-center gap-1 bg-white dark:bg-surface-dark p-1.5 rounded border border-border dark:border-border-dark w-full md:w-fit overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div
                  className="absolute h-[calc(100%-12px)] bg-black dark:bg-white rounded-sm transition-all duration-300 ease-out motion-reduce:transition-none"
                  style={{
                    left: sliderStyle.left,
                    width: sliderStyle.width,
                    opacity: sliderStyle.opacity
                  }}
                />
                {FILTERS.map(({ label, value, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    ref={(el) => {
                      buttonRefs.current[value] = el
                    }}
                    onClick={() => handleFilterClick(value)}
                    className={cn(
                      'relative z-10 flex items-center justify-center gap-2 px-3 py-1.5 rounded-sm text-xs ',
                      'font-mono uppercase transition-colors whitespace-nowrap flex-1 md:flex-initial text-gray-500 ',
                      'dark:hover:text-gray-300  cursor-pointer',
                      activeFilter === value
                        ? 'font-bold text-white mix-blend-difference'
                        : 'hover:brightness-150'
                    )}
                  >
                    {value === 'shuffle' && activeFilter === value && isFetching ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Icon size={14} />
                    )}
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-96">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearch(searchInput)
                      updateURL(activeFilter, searchInput)
                    }
                  }}
                  placeholder="Search posts and comments..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 pl-10 pr-24 py-2.5 text-sm font-mono focus:ring-1 focus:ring-black outline-none rounded-[4px]"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="bg-gray-200 hover:bg-gray-300 p-1 rounded-sm"
                      title="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearch(searchInput)
                      updateURL(activeFilter, searchInput)
                    }}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-sm text-[10px] font-bold uppercase"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {shouldShowSkeleton && <PostSkeleton />}

            {isError && !isLoading && (
              <div className="text-center py-12 text-gray-500">
                Failed to load posts.{' '}
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="underline hover:text-black dark:hover:text-white"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {!shouldShowSkeleton &&
              posts.map((post, index) => (
                <div
                  key={`${activeFilter}-${search}-${index}-${post.id}-${post.title}`}
                  className="flex bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors rounded-sm overflow-hidden"
                >
                  <div className="w-12 bg-gray-50 dark:bg-black/20 flex flex-col items-center py-4 border-r border-gray-100 dark:border-gray-800">
                    <button type="button" className="text-gray-400 hover:text-orange-500 p-1">
                      <ChevronUp size={24} />
                    </button>
                    <span className="text-xs font-bold py-1">{post.score}</span>
                    <button type="button" className="text-gray-400 hover:text-blue-500 p-1">
                      <ChevronDown size={24} />
                    </button>
                  </div>

                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
                      <span className="text-gray-500">Posted by</span>
                      <span className="text-gray-600 dark:text-gray-300 font-medium hover:underline cursor-pointer flex items-center gap-1">
                        u/{post.author.display_name}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{timeAgo(post.created_at)}</span>
                    </div>

                    <Link
                      href={`/community/posts/${post.id}`}
                      onMouseDown={() => {
                        sessionStorage.setItem('community_to_post', 'true')
                      }}
                    >
                      <h3 className="text-lg font-bold mb-3 leading-snug hover:underline decoration-1 underline-offset-4 cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                      <Link
                        href={`/community/posts/${post.id}`}
                        onMouseDown={() => {
                          sessionStorage.setItem('community_to_post', 'true')
                        }}
                        className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                      >
                        <MessageSquare size={14} /> {post.comment_count} Comments
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

            {!isLoading && !isError && posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {search ? (
                  <>
                    No posts found for &quot;{search}&quot;.{' '}
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="underline hover:text-black dark:hover:text-white"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  'No posts yet.'
                )}
              </div>
            )}

            {activeFilter === 'shuffle' && posts.length > 0 ? (
              <button
                type="button"
                onClick={handleReshuffle}
                disabled={isFetching}
                className="w-full bg-[#1e1e1e] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-widest py-4 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Shuffle size={14} />
                {isFetching ? 'Shuffling...' : 'Shuffle Again'}
              </button>
            ) : hasNextPage ? (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full bg-[#1e1e1e] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-widest py-4 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Posts'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
