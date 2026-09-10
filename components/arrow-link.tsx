'use client'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { MouseEvent, ReactNode } from 'react'

interface ArrowLinkProps {
  href?: string
  children: ReactNode
  className?: string
  leftClassName?: string
  rightClassName?: string
  fillClassName?: string
}

export function ArrowLink({
  href = '#',
  children,
  className,
  leftClassName,
  rightClassName,
  fillClassName
}: ArrowLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href === '#') {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'group inline-flex items-stretch z-0 text-xs font-medium tracking-wider uppercase overflow-hidden',
        className
      )}
    >
      {/* Left: Arrow with black background */}
      <span
        className={cn(
          'flex items-center justify-center z-10 size-8 bg-black text-white',
          leftClassName
        )}
      >
        <ArrowRight className="size-4" />
      </span>

      {/* Right: Text with expanding background */}
      <span
        className={cn(
          'relative flex items-center px-4 text-black transition-colors duration-300 group-hover:text-white group-active:text-white',
          rightClassName
        )}
      >
        {/* Background that expands from left on hover */}
        <span
          className={cn(
            'absolute inset-0 z-0 bg-black transform -translate-x-full transition-transform duration-300 ease-out ',
            'group-hover:translate-x-0 group-active:translate-x-0',
            fillClassName
          )}
          aria-hidden="true"
        />
        <span className="relative z-10">{children}</span>
      </span>
    </Link>
  )
}
