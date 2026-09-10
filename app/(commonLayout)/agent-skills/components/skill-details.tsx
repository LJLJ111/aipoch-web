import { Github } from 'lucide-react'

interface SkillDetailsProps {
  author: {
    name: string
    avatar_url: string
    org: string
  }
  license: string
  contentLanguage: string
  updatedAt: string
  githubRepoUrl: string | null
  version: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export function SkillDetails({
  author,
  license,
  contentLanguage,
  updatedAt,
  githubRepoUrl,
  version
}: SkillDetailsProps) {
  const displayAuthor = author.org || author.name

  return (
    <div className="bg-white/30 p-4 border border-black/10 rounded-md">
      <h3 className="text-xs font-medium uppercase tracking-wider text-black/60 mb-4 border-b border-black/10 pb-2">
        Details
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-black/50">Author</span>
          <span className="text-black/80">{displayAuthor}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-black/50">License</span>
          <span className="text-black/80">{license}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-black/50">Language</span>
          <span className="text-black/80">{contentLanguage}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-black/50">Updated</span>
          <span className="text-black/80">{formatDate(updatedAt)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-black/50">Version</span>
          <span className="text-black/80">{version}</span>
        </div>

        {githubRepoUrl && (
          <div className="flex justify-between items-center text-sm pt-2 border-t border-black/10">
            <span className="text-black/50">Source</span>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-black/80 hover:text-black transition-colors"
            >
              <Github className="size-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
