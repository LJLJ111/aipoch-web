import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BenchmarkSectionProps = {
  id: string
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  dark?: boolean
}

export const BenchmarkSection = ({
  id,
  eyebrow,
  title,
  description,
  children,
  dark
}: BenchmarkSectionProps) => (
  <section
    id={id}
    className={cn(
      'scroll-mt-[calc(var(--nav-h,80px)+72px)]',
      dark ? 'border-b border-[#2A2A2A] bg-[#151515] text-white' : 'bg-[#f7f7f5] text-[#111111]'
    )}
  >
    <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-20">
      <span
        className={
          dark
            ? 'mb-5 inline-flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-white/55'
            : 'mb-5 inline-flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-[#61615c]'
        }
      >
        {eyebrow}
      </span>
      <h2 className="max-w-[894px] font-[Georgia] text-4xl font-normal leading-[1.17] tracking-[-1px] sm:text-5xl sm:tracking-[-2px]">
        {title}
      </h2>
      {description ? (
        <p
          className={
            dark
              ? 'mt-5 max-w-[760px] text-[15px] leading-6 text-white/70'
              : 'mt-5 max-w-[760px] text-[15px] leading-6 text-[#61615c]'
          }
        >
          {description}
        </p>
      ) : null}
      <div className="mt-10">{children}</div>
    </div>
  </section>
)

export const sectionCardClass =
  'border border-black/10 bg-white p-5 transition-colors hover:border-black/25 sm:p-6'

export const mutedTextClass = 'text-[13px] leading-5 text-[#61615c]'
