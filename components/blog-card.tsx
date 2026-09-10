import { ArrowUpRight, Clock, Pin } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { BlogPost } from '@/lib/blog'
import { formatDate } from '@/lib/blog'

interface BlogCardProps {
  post: BlogPost
  variant: 'featured' | 'secondary'
}

export function BlogCard({ post, variant }: BlogCardProps) {
  const isFeatured = variant === 'featured'

  const cardContent = (
    <div className={cn(!isFeatured && 'flex flex-col flex-1 min-h-0')}>
      <div
        className={cn(
          'flex items-start justify-between gap-4',
          isFeatured ? 'mb-5' : 'mb-3 shrink-0'
        )}
      >
        <div className="flex items-center gap-2">
          {isFeatured && (
            <Pin className="size-4 text-red-500 fill-red-500 shrink-0 rotate-45" />
          )}
          <span className="inline-block px-2.5 py-1 rounded-none bg-gray-100 text-xs font-semibold uppercase tracking-widest text-gray-600">
            {post.frontmatter.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 shrink-0">
          <Clock className="size-3 text-gray-400" />
          <span className="uppercase">{post.frontmatter.readTime}</span>
        </div>
      </div>

      {isFeatured ? (
        <h2 className="text-2xl md:text-3xl font-bold mb-4 min-h-16 overflow-hidden line-clamp-2 group-hover:text-gray-700 transition-colors shrink-0">
          {post.frontmatter.title}
        </h2>
      ) : (
        <h3 className="text-xl font-bold mb-3 min-h-14 overflow-hidden line-clamp-2 group-hover:text-gray-700 transition-colors shrink-0">
          {post.frontmatter.title}
        </h3>
      )}

      <p
        className={cn(
          'text-gray-600 overflow-hidden line-clamp-3',
          isFeatured ? 'mb-6 h-18' : 'text-sm h-14 shrink-0'
        )}
      >
        {post.frontmatter.description}
      </p>

      {!isFeatured && <hr className="border-t border-gray-200/60 my-4 shrink-0" />}

      <div
        className={cn(
          'flex items-center shrink-0',
          isFeatured ? 'justify-between' : 'gap-2 mt-auto'
        )}
      >
        <div className={cn('flex gap-2', isFeatured ? 'items-center' : 'items-start')}>
          <div className={cn(!isFeatured && 'flex flex-col gap-0.5')}>
            <span className="text-sm font-medium text-gray-700">
              {post.frontmatter.author}
            </span>
            <span className={cn('text-xs font-mono text-gray-500', isFeatured && 'ml-2')}>
              {formatDate(post.frontmatter.date)}
            </span>
          </div>
        </div>
        {isFeatured && (
          <ArrowUpRight className="size-5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
        )}
      </div>
    </div>
  )

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group block w-full border border-black/10 bg-white hover:border-black/20 hover:shadow-lg transition-all duration-200',
        isFeatured ? 'mb-12 p-8' : 'p-6 flex flex-col h-full'
      )}
    >
      {cardContent}
    </Link>
  )
}
