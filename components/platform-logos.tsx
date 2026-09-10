import { Terminal } from 'lucide-react'
import type { ReactNode } from 'react'

export const AppleLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className ?? 'size-4 shrink-0 opacity-75'}
  >
    <path d="M17.05 12.54c-.03-2.36 1.93-3.49 2.02-3.55-1.1-1.61-2.81-1.83-3.42-1.86-1.45-.15-2.84.86-3.58.86-.74 0-1.88-.84-3.09-.82-1.59.02-3.06.93-3.88 2.35-1.65 2.87-.42 7.12 1.19 9.45.79 1.14 1.73 2.42 2.96 2.37 1.19-.05 1.64-.77 3.07-.77 1.44 0 1.84.77 3.09.75 1.28-.02 2.09-1.16 2.87-2.31.9-1.32 1.28-2.6 1.3-2.67-.03-.01-2.5-.96-2.53-3.8zM14.7 5.6c.66-.8 1.1-1.9.98-3-.94.04-2.09.63-2.77 1.42-.61.71-1.14 1.84-1 2.92 1.06.08 2.13-.53 2.79-1.34z" />
  </svg>
)

export const WindowsLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className ?? 'size-4 shrink-0 opacity-75'}
  >
    <path d="M3 5.55 10.44 4.5v7.14H3V5.55zM3 18.45l7.44 1.05v-7.05H3v6zM11.56 19.65 21 21v-8.55h-9.44v7.2zM11.56 4.35v7.29H21V3L11.56 4.35z" />
  </svg>
)

export type PlatformLogoKind = 'apple' | 'windows' | 'linux'

export const platformLogo = (icon: PlatformLogoKind, className?: string): ReactNode => {
  if (icon === 'apple') return <AppleLogo className={className} />
  if (icon === 'windows') return <WindowsLogo className={className} />
  return (
    <Terminal
      className={className ?? 'size-4 shrink-0 opacity-75'}
      aria-hidden="true"
    />
  )
}
