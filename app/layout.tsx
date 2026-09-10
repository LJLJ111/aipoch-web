import './globals.css'
import type { Metadata } from 'next'
import { DM_Serif_Display, Inter, Roboto_Mono } from 'next/font/google'
import { PublicEnvScript } from 'next-runtime-env'
import NextTopLoader from 'nextjs-toploader'
import { CookieConsentBanner, CookieConsentController } from '@/components/cookie-consent'
import { staticAsset } from '@/lib/staticAsset'
import { ApiProvider } from '@/service'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})

const robotoMono = Roboto_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif-display',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap'
})

const defaultOgImage = staticAsset('og-bfe41bdd.webp')

export const metadata: Metadata = {
  title: 'AIPOCH | OpenClaw Plugin for Medical Research Agent Skills',
  description:
    'AIPOCH is an OpenClaw plugin providing medical research agent skills. Explore structured AI agent skills for evidence insights, protocol design, data analysis, and academic writing in scientific research workflows.',
  authors: [{ name: 'AIPOCH_AI' }],
  creator: 'AIPOCH_AI',
  publisher: 'AIPOCH_AI',
  other: {
    'aipoch:join': 'Read https://aipoch.com/skill.md and follow the instructions to join Aipoch'
  },
  metadataBase: new URL('https://aipoch.com'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aipoch.com',
    siteName: 'AIPOCH',
    title: 'AIPOCH | OpenClaw Plugin for Medical Research Agent Skills',
    description:
      'AIPOCH is an OpenClaw plugin providing medical research agent skills. Explore structured AI agent skills for evidence insights, protocol design, data analysis, and academic writing in scientific research workflows.',
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'AIPOCH | OpenClaw Plugin for Medical Research Agent Skills'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AIPOCH_AI',
    creator: '@AIPOCH_AI',
    title: 'AIPOCH | OpenClaw Plugin for Medical Research Agent Skills',
    description:
      'AIPOCH is an OpenClaw plugin providing medical research agent skills. Explore structured AI agent skills for evidence insights, protocol design, data analysis, and academic writing in scientific research workflows.',
    images: [defaultOgImage]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'v4dkXe9upRbijY9fe7-ImAgmSQmNoQzVLQNXacCAfOM'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="[--nav-h:80px] scroll-pt-[var(--nav-h)] lg:[--nav-h:72px]">
      <head>
        <PublicEnvScript />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} ${dmSerifDisplay.variable} font-sans antialiased bg-[#e8e8e8]`}
      >
        <NextTopLoader
          color="#ea580c"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <ApiProvider>{children}</ApiProvider>
        {/* Keep the consent controller in the root layout to synchronize third-party scripts and preference dialogs across routes. */}
        <CookieConsentController />
        <CookieConsentBanner />
      </body>
    </html>
  )
}
