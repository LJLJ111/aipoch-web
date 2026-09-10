'use client'

import { cn } from '@/lib/utils'
import { List } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TocItem {
  value: string
  href: string
  depth: number
}

interface TableOfContentsProps {
  toc: TocItem[]
  className?: string
}

export function TableOfContents({ toc, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  // Filter only h1 and h2
  const filteredToc = toc.filter((item) => item.depth <= 2)

  useEffect(() => {
    if (filteredToc.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          // Sort by position and get the topmost one
          const topEntry = visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0]
          setActiveId(topEntry.target.id)
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0
      }
    )

    // Observe all headings. Use getElementById because IDs may start with digits or contain characters invalid in querySelector.
    filteredToc.forEach((item) => {
      const id = item.href.startsWith('#') ? item.href.slice(1) : item.href
      const element = id ? document.getElementById(id) : null
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [filteredToc])

  if (filteredToc.length === 0) return null

  return (
    <nav aria-label="On this page" className={cn(className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-amber-600 uppercase tracking-wider mb-4">
        <List className="size-4" />
        <span>On This Page</span>
      </div>
      <ul className="space-y-2">
        {filteredToc.map((item) => {
          const isActive = activeId === item.href.slice(1)
          return (
            <li
              key={item.href}
              className={cn(
                'text-sm transition-colors',
                item.depth === 1 && 'font-medium',
                item.depth === 2 && 'pl-4',
                isActive ? 'text-amber-600' : item.depth === 1 ? 'text-gray-900' : 'text-gray-600'
              )}
            >
              <a href={item.href} className="block py-1 hover:text-amber-600 transition-colors">
                {item.value}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
