import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function BlogSidebarCTA() {
  return (
    <div className="bg-[#1a1a1a] rounded-none p-6 text-white">
      <h3 className="text-lg font-semibold mb-2">Ready to apply this?</h3>
      <p className="text-sm text-gray-300 mb-4">
      Browse our library of pre-built skills and start
      automating your research workflows today.
      </p>
      <Link
        href="/agent-skills"
        aria-label="Explore pre-built agent skills"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white hover:text-amber-400 transition-colors"
      >
        EXPLORE SKILLS
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
