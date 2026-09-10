import { ArrowRight, Download, Eye } from 'lucide-react'
import Link from 'next/link'

import type { Skill } from '@/service/skills'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  const roundedScore = skill.score != null ? Math.round(skill.score) : null
  const skillPath = skill.path ?? skill.name

  return (
    <Link
      href={`/agent-skills/${skillPath}`}
      scroll={false}
      className="group flex flex-col border border-black/10 bg-white/50 p-6 transition-colors hover:border-black/50 cursor-pointer"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-black/40">
          {typeof skill.categories[0] === 'object' && skill.categories[0] !== null
            ? (skill.categories[0] as { name: string }).name
            : (skill.categories[0] as string) || ''}
        </span>
        <div className="flex items-center gap-3 text-xs text-black/40">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {skill.stats.views}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {skill.stats.downloads}
          </span>
          {roundedScore != null && (
            <span className="ml-1 flex items-center justify-center rounded px-2 py-1 text-xs font-bold bg-[#DCFCE7] text-[#166534]">
              {roundedScore}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-medium text-black group-hover:underline underline-offset-4">
        {skill.title}
      </h3>

      {/* Description */}
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-black/60">{skill.description}</p>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        {skill.tags.map((tag, index) => {
          const tagName =
            typeof tag === 'object' && tag !== null
              ? (tag as { name: string }).name
              : (tag as string)
          return (
            <span
              key={tagName + index}
              className="border border-black/20 px-2 py-1 text-xs uppercase tracking-wider text-black/50"
            >
              {tagName}
            </span>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-4">
        <span className="text-sm text-black/60">{skill.author.name}</span>
        <ArrowRight className="h-4 w-4 text-black/40 -rotate-45 group-hover:rotate-0 transition" />
      </div>
    </Link>
  )
}
