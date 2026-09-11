import type { Metadata } from 'next'

export interface PageSocialImage {
  url: string
  width: number
  height: number
  alt: string
}

interface PageMetadataOptions {
  title: string
  description: string
  canonical: string
  type?: 'website' | 'article'
  image?: PageSocialImage
}

/** Build complete page-level metadata without relying on route-specific root fallbacks. */
export const createPageMetadata = ({
  title,
  description,
  canonical,
  type = 'website',
  image
}: PageMetadataOptions): Metadata => ({
  title,
  description,
  alternates: { canonical },
  openGraph: {
    type,
    locale: 'en_US',
    url: canonical,
    siteName: 'AIPOCH',
    title,
    description,
    ...(image && { images: [image] })
  },
  twitter: {
    card: image ? 'summary_large_image' : 'summary',
    site: '@AIPOCH_AI',
    creator: '@AIPOCH_AI',
    title,
    description,
    ...(image && { images: [image.url] })
  }
})
