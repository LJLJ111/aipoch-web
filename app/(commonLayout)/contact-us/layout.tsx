import type { ReactNode } from 'react'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'

export const metadata = createPageMetadata({
  title: 'Contact AIPOCH | Product, Support, and Partnership Inquiries',
  description: 'Contact AIPOCH about product support, partnerships, or media inquiries.',
  canonical: `${SITE_DOMAIN}/contact-us`
})

export default function ContactUsLayout({ children }: { children: ReactNode }) {
  return children
}
