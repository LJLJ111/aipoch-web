import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

const externalLinkClass =
  'flex min-h-12 items-center justify-between gap-3 rounded-none border border-black/10 bg-white px-4 py-3 text-sm text-black transition-colors hover:border-black/40 hover:bg-[#f3f3f3]'

// Expose these MDX components only to policy pages so regular articles do not inherit their compliance card styles.
export const PolicyCookieCategoryGrid = ({ children }: { children: ReactNode }) => (
  <div className="not-prose my-6 grid gap-3 md:grid-cols-2">{children}</div>
)

export const PolicyCookieCategory = ({
  badge,
  title,
  children
}: {
  badge: string
  title: string
  children: ReactNode
}) => (
  <article className="rounded-none border border-black/10 bg-white p-5">
    <span className="inline-flex rounded-none border border-black/10 bg-[#efefef] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black/60">
      {badge}
    </span>
    <h3 className="mt-4 text-base font-semibold text-black">{title}</h3>
    <div className="mt-2 text-sm leading-6 text-black/65">{children}</div>
  </article>
)

export const PolicyExternalLinks = ({ children }: { children: ReactNode }) => (
  <div className="not-prose my-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{children}</div>
)

export const PolicyExternalLink = ({
  href,
  children
}: {
  href: ComponentProps<typeof Link>['href']
  children: ReactNode
}) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
    <span>{children}</span>
    <span aria-hidden="true">-&gt;</span>
  </Link>
)

export const policyMdxComponents = {
  PolicyCookieCategoryGrid,
  PolicyCookieCategory,
  PolicyExternalLinks,
  PolicyExternalLink
}
