'use client'

import { useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { BlogCard } from '@/components/blog-card'
import { BlogCardSkeleton } from '@/components/blog-card-skeleton'
import { mapListItemToBlogPost, type BlogPost } from '@/lib/blog'
import type { BlogPostsListData } from '@/service/blog'
import { useInfiniteBlogPosts } from '@/service/blog'

const PAGE_SIZE = 21
const SCROLL_STORAGE_KEY = 'blog-list-scroll-position'

interface BlogListClientProps {
  /** First-page data prefetched on the server in useInfiniteQuery format. */
  initialData?: { pages: BlogPostsListData[]; pageParams: number[] }
}

export function BlogListClient({ initialData }: BlogListClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteBlogPosts(PAGE_SIZE, initialData)

  const posts: BlogPost[] = useMemo(
    () => data?.pages.flatMap((p) => p.items.map(mapListItemToBlogPost)) ?? [],
    [data]
  )

  // Restore the scroll position when returning from a detail page.
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    const savedPosition = sessionStorage.getItem(SCROLL_STORAGE_KEY)
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10))
      sessionStorage.removeItem(SCROLL_STORAGE_KEY)
    }
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a')
      const href = link?.getAttribute('href')
      if (window.location.pathname === '/blog' && href?.startsWith('/blog/') && href !== '/blog') {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, window.scrollY.toString())
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Load more posts when loadMoreRef enters the viewport.
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
          fetchNextPage()
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage])

  const featured = posts[0]
  const restPosts = posts.slice(1) // Display two posts per row starting with the second post.

  return (
    <div className="w-full min-w-0">
      {featured && <BlogCard post={featured} variant="featured" />}
      {restPosts.length > 0 && (
        <div className={cn(featured && 'mt-12')}>
          <div className="grid md:grid-cols-2 gap-8 w-full">
            {restPosts.map((post) => (
              <BlogCard key={post.slug} post={post} variant="secondary" />
            ))}
          </div>
        </div>
      )}

      {/* Scroll sentinel and loading skeletons. */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8">
          {isFetchingNextPage && (
            <div className="grid md:grid-cols-2 gap-8 w-full">
              {[...Array(4)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {posts.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 py-12">No blog posts yet.</p>
      )}
    </div>
  )
}
