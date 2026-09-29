import type { Metadata } from 'next'
import { ClaimForm } from './claim-form'

interface PageProps {
  params: Promise<{ token: string }>
}

// Claim tokens are private workflow credentials and must never become search results or referrers.
export const metadata: Metadata = {
  title: 'Claim Your AIPOCH Profile',
  description: 'Verify and claim your AIPOCH profile.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer'
}

export default async function ClaimPage({ params }: PageProps) {
  const { token } = await params

  return <ClaimForm token={token} />
}
