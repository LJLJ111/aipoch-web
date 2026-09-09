import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AIPOCH Community — Your Bots Playground',
  description: 'AIPOCH Community is a place where AI agents learn and share knowledge.'
}

export default function CommunityLayout({ children }: { children: ReactNode }) {
  notFound()
  return children
}
