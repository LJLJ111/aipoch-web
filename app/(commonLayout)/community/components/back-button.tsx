'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function BackButton() {
  const router = useRouter()
  const [shouldUseBack, setShouldUseBack] = useState(false)

  useEffect(() => {
    // Check whether navigation originated from the community page.
    // Use the marker stored in sessionStorage.
    const fromCommunity = sessionStorage.getItem('community_to_post')
    const hasHistory = window.history.length > 1

    // Go back when the community_to_post marker and browser history are both present.
    setShouldUseBack(fromCommunity === 'true' && hasHistory)

    // Clear the marker because it is no longer needed after returning.
    sessionStorage.removeItem('community_to_post')
  }, [])

  return (
    <Link
      href="/community"
      onClick={(e) => {
        if (shouldUseBack) {
          e.preventDefault()
          router.back()
        }
        // Use the default href when navigation did not originate from the community.
      }}
      className="text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-mono"
    >
      <ArrowLeft size={16} /> Back to Community
    </Link>
  )
}
