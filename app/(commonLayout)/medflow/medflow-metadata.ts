import type { Metadata } from 'next'

export const medFlowSeo = {
  title: 'MedFlow — A new signal is coming · AIPOCH',
  description:
    'MedFlow is the next signal from AIPOCH. A new way to turn the complexity of medical research into clarity you can trust. Arriving July 2026 — join the waitlist.',
  url: 'https://aipoch.com/medflow'
} as const

export const medFlowMetadata: Metadata = {
  title: medFlowSeo.title,
  description: medFlowSeo.description,
  alternates: {
    canonical: medFlowSeo.url
  },
  openGraph: {
    title: medFlowSeo.title,
    description: medFlowSeo.description,
    url: medFlowSeo.url,
    siteName: 'AIPOCH',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: medFlowSeo.title,
    description: medFlowSeo.description
  }
}
