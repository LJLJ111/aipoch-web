'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DesignIcon } from '@/components/design-icon'
import type { Guide } from '@/lib/guides'
import { cn } from '@/lib/utils'

interface GuidesDirectoryProps {
  guides: Guide[]
  className?: string
}

export function GuidesDirectory({ guides, className }: GuidesDirectoryProps) {
  const pathname = usePathname()

  const currentSlug = pathname?.startsWith('/guides/')
    ? (pathname.replace('/guides/', '').split('/')[0] ?? '')
    : ''

  if (!guides?.length) return null

  return (
    <nav className={cn('p-4 text-[#61615c]', className)} aria-label="Guides modules">
      <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.06em] mb-4">
        <DesignIcon name="155aa" size={16} />
        <span>MODULES</span>
      </div>

      <ul className="space-y-1">
        {guides.map(({ slug, frontmatter }, index) => {
          const num = String(index + 1).padStart(2, '0')
          const isActive = currentSlug === slug

          return (
            <li key={slug}>
              <Link
                aria-current={isActive ? 'page' : undefined}
                href={`/guides/${slug}`}
                className={cn(
                  'relative flex items-start py-2 px-3 -mx-1 font-[Georgia] text-sm leading-5',
                  'transition-colors duration-200 ease-out',
                  'hover:bg-[#f5f0e7]',
                  isActive && 'bg-[#f5f0e7]'
                )}
              >
                <span
                  className={cn(
                    'absolute inset-y-0 left-0 w-0.5',
                    isActive ? 'bg-[#d08d23]' : 'bg-transparent'
                  )}
                  aria-hidden="true"
                />

                <span className={cn('wrap-break-word min-w-0', 'text-[#2e2e2b]')}>
                  {num} {frontmatter.title}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
