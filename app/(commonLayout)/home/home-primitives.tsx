import type { ReactNode } from 'react'
import { HomeReveal } from './home-motion'

export const Eyebrow = ({
  children,
  dark = false,
  lineTestId
}: {
  children: ReactNode
  dark?: boolean
  lineTestId?: string
}) => (
  <div
    className={`mb-[22px] inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? 'text-[#8b909b]' : 'text-[#555]'}`}
  >
    <i data-testid={lineTestId} className="h-px w-[22px] shrink-0 bg-[#caa93a]" />
    {children}
  </div>
)

const sectionIntroColumns = {
  balanced: 'lg:grid-cols-2',
  leadWide: 'lg:grid-cols-[0.82fr_1.18fr]',
  titleWide: 'lg:grid-cols-[1.18fr_0.82fr]'
} as const

export type SectionIntroLayout = keyof typeof sectionIntroColumns

export const SectionIntro = ({
  eyebrow,
  title,
  lead,
  dark = false,
  titleTestId,
  layout = 'leadWide'
}: {
  eyebrow: ReactNode
  title: ReactNode
  lead: ReactNode
  dark?: boolean
  titleTestId?: string
  layout?: SectionIntroLayout
}) => (
  <div
    className={`mb-[clamp(40px,6vw,70px)] grid gap-[clamp(24px,4vw,60px)] ${sectionIntroColumns[layout]} lg:items-end`}
  >
    <HomeReveal>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2
        data-testid={titleTestId}
        className={`text-[clamp(32px,5.2vw,64px)] font-extrabold leading-none tracking-[-0.035em] ${dark ? 'text-white' : 'text-[#111]'}`}
      >
        {title}
      </h2>
    </HomeReveal>
    <HomeReveal delay={0.09}>
      <p
        className={`text-[clamp(15px,1.5vw,18px)] leading-[1.7] ${layout === 'leadWide' ? 'max-w-[72ch]' : 'max-w-[62ch]'} ${dark ? 'text-[#b7bcc6] [&_b]:font-semibold [&_b]:text-white' : 'text-[#555] [&_b]:font-semibold [&_b]:text-[#111]'}`}
      >
        {lead}
      </p>
    </HomeReveal>
  </div>
)
