'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ScienceImportButton, ScienceImportDetailFeedback } from './science-import-controls'

export const UseCaseActions = ({
  slug,
  packageUrl,
  children
}: {
  slug: string
  packageUrl?: string
  children?: ReactNode
}) => (
  <section aria-label="Research actions" className="flex flex-wrap items-center gap-3">
    {/* On mobile, feedback follows import before the independent report and download actions. */}
    <div className="contents max-sm:[&>a]:order-2">
      {packageUrl ? <ScienceImportButton variant="detail" /> : null}
      {children}
      {packageUrl ? (
        <a
          href={packageUrl}
          className="inline-flex min-h-11 items-center border border-[#10110f] bg-white px-5 text-[13px] font-semibold text-[#10110f] transition-colors hover:bg-[#10110f] hover:text-white"
        >
          Download research package
        </a>
      ) : null}
      <Link
        href={`/open-science/use-cases/${slug}/replay`}
        className="inline-flex min-h-11 items-center border border-[#10110f] bg-white px-5 text-[13px] font-semibold text-[#10110f] transition-colors hover:bg-[#10110f] hover:text-white active:bg-white active:text-[#10110f]"
      >
        View the research session
      </Link>
    </div>
    {packageUrl ? <ScienceImportDetailFeedback /> : null}
  </section>
)
