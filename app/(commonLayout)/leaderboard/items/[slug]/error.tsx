'use client'

import { NotFoundContent } from '../../../../components/not-found-content'

export default function LeaderboardItemError({
  error: _error,
  reset: _reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <NotFoundContent />
}
