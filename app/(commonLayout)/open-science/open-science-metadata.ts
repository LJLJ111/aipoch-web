import type { Metadata } from 'next'
import { SITE_DOMAIN } from '@/lib/config'

// Keep the requested page SEO copy aligned across metadata and visible heading surfaces.
export const openScienceSeo = {
  title: 'AIPOCH Open-Science | Open-Source AI Research Workbench',
  description:
    'AIPOCH Open-Science is an open-source, local-first AI research workbench with model choice, code execution, reviewer checks, and traceable artifacts.'
} as const

const openSciencePageUrl = `${SITE_DOMAIN}/open-science`
const openScienceOgImage = {
  url: `${SITE_DOMAIN}/open-science/og-science-open-to-all.jpg`,
  width: 1024,
  height: 537,
  alt: 'Science, Open to All — AIPOCH Open-Science'
} as const

export const openScienceMetadata: Metadata = {
  title: openScienceSeo.title,
  description: openScienceSeo.description,
  alternates: { canonical: openSciencePageUrl },
  openGraph: {
    type: 'website',
    url: openSciencePageUrl,
    siteName: 'AIPOCH',
    title: openScienceSeo.title,
    description: openScienceSeo.description,
    images: [openScienceOgImage]
  },
  twitter: {
    card: 'summary_large_image',
    title: openScienceSeo.title,
    description: openScienceSeo.description,
    images: [openScienceOgImage.url]
  }
}
