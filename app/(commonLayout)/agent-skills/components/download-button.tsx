'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useCallback, useState } from 'react'
import { AIPOCH_GITHUB_URL } from '@/lib/config'
import { fetchGithubDownloadUrl } from '@/service/skills'

interface DownloadButtonProps {
  skillPath: string
}

export function DownloadButton({ skillPath }: DownloadButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const redirectToGithub = useCallback(() => {
    window.open(AIPOCH_GITHUB_URL, '_blank', 'noopener,noreferrer')
  }, [])

  const handleDownload = useCallback(async () => {
    setIsRedirecting(true)
    try {
      await fetchGithubDownloadUrl(skillPath)
    } finally {
      redirectToGithub()
      setIsRedirecting(false)
    }
  }, [redirectToGithub, skillPath])

  return (
    <Button
      onClick={handleDownload}
      disabled={isRedirecting}
      className="bg-black text-white hover:bg-black/70 py-6 px-6 disabled:opacity-50 rounded-none"
    >
      <Download className="h-4 w-4 mr-2" />
      Download Skills
    </Button>
  )
}
