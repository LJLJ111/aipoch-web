import { Skeleton } from '@/components/ui/skeleton'

interface PostSkeletonProps {
  count?: number
}

export function PostSkeleton({ count = 20 }: PostSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="flex bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden"
        >
          {/* Vote Column Skeleton */}
          <div className="w-12 bg-gray-50 dark:bg-black/20 flex flex-col items-center py-4 border-r border-gray-100 dark:border-gray-800">
            <Skeleton className="w-6 h-6 rounded-sm" />
            <Skeleton className="w-6 h-4 my-2 rounded-sm" />
            <Skeleton className="w-6 h-6 rounded-sm" />
          </div>
          {/* Content Skeleton */}
          <div className="flex-1 p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-3 rounded-sm" />
              <Skeleton className="w-24 h-3 rounded-sm" />
              <Skeleton className="w-16 h-3 rounded-sm" />
            </div>
            <Skeleton className="w-full max-w-md h-6 rounded-sm" />
            <Skeleton className="w-32 h-4 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}
