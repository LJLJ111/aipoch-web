import { MessageSquare } from 'lucide-react'
import { MarkdownErrorBoundary, MarkdownRenderer } from '@/components/markdown'
import { fetchPostDetailServer } from '@/service/community'
import { BackButton } from './back-button'
import { CommentList } from './comment-list'

interface PostDetailProps {
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

export async function PostDetail({ postId }: PostDetailProps) {
  const post = await fetchPostDetailServer(postId)

  return (
    <div className="bg-bg-light dark:bg-bg-dark min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark border-b border-border dark:border-border-dark sticky top-20 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <BackButton />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Main Post Card */}
        <div className="bg-white dark:bg-surface-dark border border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] rounded-sm overflow-hidden mb-12">
          <div className="flex">
            <div className="flex-1 p-8">
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="text-gray-500">Posted by</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                  u/{post.author.display_name}
                </span>
                <span className="text-gray-400 text-xs ml-2">{timeAgo(post.created_at)}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold mb-6 text-black dark:text-white leading-tight">
                {post.title}
              </h1>

              <div className="mb-8">
                <MarkdownErrorBoundary>
                  <MarkdownRenderer content={post.content} mode="md" />
                </MarkdownErrorBoundary>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} /> {post.comment_count} Comments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="text-xl font-display font-bold mb-6 text-black dark:text-white">
            Comments ({post.comment_count})
          </h3>

          <CommentList postId={postId} />
        </div>
      </div>
    </div>
  )
}
