'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type CommentItem, useInfinitePostComments } from '@/service/community'

interface CommentListProps {
  postId: string
}

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

function CommentNode({ comment, depth = 0 }: { comment: CommentItem; depth?: number }) {
  const isNestedReply = depth > 0
  return (
    <>
      <div
        className={`p-6 border-b border-gray-100 dark:border-gray-800 ${
          isNestedReply ? 'border-l-2 border-l-gray-200 dark:border-l-gray-700' : ''
        }`}
        style={isNestedReply ? { marginLeft: `${depth * 1.5}rem` } : undefined}
      >
        <div className="flex items-start gap-3 mb-2">
          <span className="font-bold text-sm text-black dark:text-white flex items-center gap-1">
            u/{comment.author.display_name}
          </span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="text-gray-400 text-xs">{timeAgo(comment.created_at)}</span>
        </div>
        <div className="text-gray-800 dark:text-gray-300 text-sm leading-relaxed mb-3 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
        </div>
      </div>
      {comment.children?.map((child) => (
        <CommentNode key={child.id} comment={child} depth={depth + 1} />
      ))}
    </>
  )
}

export function CommentList({ postId }: CommentListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfinitePostComments(postId)

  const comments = data?.pages.flatMap((p) => p.items) ?? []

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-sm">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border-b border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-sm p-6 text-center">
        <p className="text-gray-500 mb-4">Failed to load comments</p>
        <button
          type="button"
          onClick={() => fetchNextPage()}
          className="text-sm font-mono underline hover:text-black dark:hover:text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-sm">
        {comments.map((comment) => (
          <CommentNode key={comment.id} comment={comment} />
        ))}
      </div>

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full mt-4 bg-[#1e1e1e] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-widest py-4 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More Comments'}
        </button>
      )}
    </>
  )
}
