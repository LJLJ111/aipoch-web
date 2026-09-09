import { Skeleton } from '@/components/ui/skeleton'

/** Blog card skeleton for loading more posts on scroll. */
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col border border-black/10 bg-white p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-3 shrink-0">
        <Skeleton className="h-6 w-24 rounded-md bg-black/5" />
        <Skeleton className="h-4 w-16 rounded bg-black/5" />
      </div>
      <Skeleton className="h-8 w-4/5 rounded mb-3 shrink-0 bg-black/5" />
      <div className="h-14 space-y-2 shrink-0">
        <Skeleton className="h-4 w-full rounded bg-black/5" />
        <Skeleton className="h-4 w-full rounded bg-black/5" />
        <Skeleton className="h-4 w-2/3 rounded bg-black/5 shrink-0" />
      </div>
      <hr className="border-t border-gray-200/60 my-4 shrink-0" />
      <div className="flex items-center gap-2 mt-auto shrink-0">
        <Skeleton className="size-10 rounded-full bg-black/5" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20 rounded bg-black/5" />
          <Skeleton className="h-3 w-24 rounded bg-black/5" />
        </div>
      </div>
    </div>
  )
}
