import type { ReactNode } from 'react'

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
    className={
      dark
        ? 'border-b border-[#2A2A2A] bg-[#151515] text-white'
        : 'border-b border-[#D4D4D4] bg-[#E9E9E9] text-[#111111]'
    }
  >
    <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-20">
      {/* Section headings mirror the leaderboard style while keeping dense benchmark content scannable. */}
      <span
        className={
          dark
            ? 'mb-5 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 before:h-px before:w-6 before:bg-white/40'
            : 'mb-5 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#707070] before:h-px before:w-6 before:bg-[#707070]'
        }
      >
        {eyebrow}
      </span>
      <h2 className="max-w-[840px] text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={
            dark
              ? 'mt-5 max-w-[760px] text-[15px] leading-7 text-white/70'
              : 'mt-5 max-w-[760px] text-[15px] leading-7 text-[#555555]'
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

export const mutedTextClass = 'text-[13px] leading-6 text-[#555555]'
