import { Skeleton } from '@/components/ui/skeleton'

// Category button skeletons shown while categories load.
export function CategoryButtonsSkeleton() {
  return (
    <div className="-mx-4 flex-1 overflow-x-auto px-4">
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-none bg-black/5" />
        ))}
      </div>
    </div>
  )
}

// Complete filter bar skeleton, including category buttons and the search field.
export function FilterBarSkeleton() {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:gap-10 lg:flex-row lg:items-end lg:justify-between">
      <CategoryButtonsSkeleton />
      <div className="w-full lg:w-[320px] shrink-0 lg:mb-2">
        <div className="ml-auto w-full space-y-2 lg:w-[276px]">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16 rounded-none bg-black/5" />
            <Skeleton className="h-4 w-20 rounded-none bg-black/5" />
            <Skeleton className="h-4 w-14 rounded-none bg-black/5" />
          </div>
          <Skeleton className="h-10 w-full rounded-none bg-black/5" />
        </div>
      </div>
    </div>
  )
}

export function SkillCardSkeleton() {
  return (
    <div className="flex flex-col border border-black/5 bg-white/30 p-6">
      {/* Header: Category + Stats */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3 w-16 rounded-none bg-black/5" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-12 rounded-none bg-black/5" />
          <Skeleton className="h-3 w-12 rounded-none bg-black/5" />
        </div>
      </div>

      {/* Title */}
      <Skeleton className="mb-2 h-6 w-4/5 rounded-none bg-black/8" />

      {/* Description */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full rounded-none bg-black/5" />
        <Skeleton className="h-4 w-full rounded-none bg-black/5" />
        <Skeleton className="h-4 w-2/3 rounded-none bg-black/5" />
      </div>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-none bg-black/5" />
        <Skeleton className="h-6 w-20 rounded-none bg-black/5" />
        <Skeleton className="h-6 w-14 rounded-none bg-black/5" />
      </div>

      {/* Footer: Author + Arrow */}
      <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
        <Skeleton className="h-4 w-24 rounded-none bg-black/5" />
        <Skeleton className="h-4 w-4 rounded-none bg-black/5" />
      </div>
    </div>
  )
}

export function SkillListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <SkillCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function SkillsSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8 lg:pb-32">
      <FilterBarSkeleton />
      <SkillListSkeleton />
    </section>
  )
}
