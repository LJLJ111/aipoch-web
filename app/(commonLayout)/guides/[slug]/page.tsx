import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DesignIcon } from '@/components/design-icon'
import { GuidesDirectory } from '@/components/guides-directory'
import { JsonLd } from '@/components/json-ld'
import { MarkdownRenderer } from '@/components/markdown'
import { TableOfContents } from '@/components/markdown/toc'
import { SITE_DOMAIN } from '@/lib/config'
import { guidePageLastModified } from '@/lib/guide-page-metadata'
import { getAdjacentGuides, getAllGuides, getGuide } from '@/lib/guides'
import { createPageMetadata } from '@/lib/page-metadata'
import { staticAsset } from '@/lib/staticAsset'
import { extractToc } from '@/lib/toc'
import styles from '../guide.module.css'

interface GuidePageProps {
  params: Promise<{ slug: string }>
}

const GUIDE_SEO: Record<string, { title: string; description?: string }> = {
  'get-started-with-skills': {
    title: 'Get Started with Skills | AIPOCH'
  },
  'what-is-a-skill': {
    title: 'What Are Agent Skills? Reusable AI Packages Explained',
    description:
      'Discover Agent Skills, reusable AI packages that teach AI agents how to perform tasks reliably, store knowledge, and maintain consistency across workflows.'
  },
  'build-your-own-skill': {
    title: 'Build Your Own Agent Skill — Create and Automate Tasks with AI',
    description:
      'Learn how to create reusable Agent Skills that let AI Agents follow workflows consistently. Step-by-step guidance on designing, testing, and improving skills for task automation, with examples and reference materials.'
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) notFound()

  const seo = GUIDE_SEO[slug]
  const title = seo?.title ?? `${guide.frontmatter.title} | AIPOCH`
  const description = seo?.description ?? guide.frontmatter.description

  return createPageMetadata({
    title,
    description,
    canonical: `${SITE_DOMAIN}/guides/${slug}`,
    type: 'article'
  })
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide) {
    notFound()
  }

  const guides = await getAllGuides()
  const toc = await extractToc(guide.content)
  const { prev, next } = await getAdjacentGuides(slug)
  const ogImage = staticAsset('og-bfe41bdd.webp')

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.frontmatter.title,
    description: guide.frontmatter.description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_DOMAIN}/guides/${slug}`
    },
    image: ogImage,
    author: {
      '@type': 'Organization',
      name: 'AIPOCH',
      url: SITE_DOMAIN
    },
    publisher: {
      '@type': 'Organization',
      name: 'AIPOCH',
      logo: {
        '@type': 'ImageObject',
        url: ogImage
      }
    },
    url: `${SITE_DOMAIN}/guides/${slug}`,
    datePublished: '2026-02-09T00:00:00Z',
    dateModified: guidePageLastModified(guide.frontmatter.lastModified)
  }

  return (
    <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-5 pt-12 pb-22 sm:px-8 xl:grid-cols-[minmax(0,768px)_minmax(0,1fr)] lg:pb-32">
      <main className="min-w-0">
        <JsonLd data={articleSchema} />
        {/* Article header. */}
        <header className="mb-8">
          <div className="mb-6 flex items-center gap-2 text-xs font-medium leading-4 text-[#61615c]">
            <DesignIcon name="7b545" size={12} />
            <span>{guide.frontmatter.readTime}</span>
          </div>
          <h1 className="font-[Georgia] text-4xl font-normal leading-[1.2] tracking-[-1.5px] text-[#111] md:text-[56px] md:leading-[68px] md:tracking-[-2px]">
            {guide.frontmatter.title}
          </h1>
          <p className="mt-6 text-base leading-[26px] text-[#61615c]">
            {guide.frontmatter.description}
          </p>
        </header>

        <div className={styles.article}>
          <MarkdownRenderer content={guide.content} />
        </div>

        {/* Previous/next navigation. */}
        <nav aria-label="Adjacent guides" className="mt-16 border-t border-[#e7e5de] pt-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            {prev ? (
              <Link
                href={`/guides/${prev.slug}`}
                className="min-w-0 flex-1 group p-5 border border-[#e7e5de] hover:bg-[#f5f0e7] transition-colors"
              >
                <p className="font-[Georgia] text-lg font-normal mt-1 flex items-center justify-start gap-2 group-hover:text-[#111] transition-colors">
                  <ArrowLeft size={16} /> {prev.frontmatter.title}
                </p>
                <p className="text-sm text-[#61615c] mt-1 line-clamp-2">
                  {prev.frontmatter.description}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {next ? (
              <Link
                href={`/guides/${next.slug}`}
                className="min-w-0 flex-1 group p-5 border border-[#e7e5de] hover:bg-[#f5f0e7] transition-colors text-right"
              >
                <p className="font-[Georgia] text-lg font-normal mt-1 flex items-center justify-end gap-2 group-hover:text-[#111] transition-colors">
                  {next.frontmatter.title} <DesignIcon name="1ece8" size={16} />
                </p>
                <p className="text-sm text-[#61615c] mt-1 line-clamp-2">
                  {next.frontmatter.description}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </nav>
      </main>
      <aside className="hidden min-w-0 xl:block">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <GuidesDirectory guides={guides} />
          <TableOfContents className="mt-6 p-4" toc={toc} variant="guide" />
        </div>
      </aside>
    </div>
  )
}

// Generate static route parameters.
export async function generateStaticParams() {
  const guides = await getAllGuides()
  return guides.map((g) => ({ slug: g.slug }))
}
