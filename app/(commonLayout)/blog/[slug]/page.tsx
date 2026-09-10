import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogSidebarCTA } from '@/components/blog-sidebar'
import { JsonLd } from '@/components/json-ld'
import { MarkdownRenderer } from '@/components/markdown'
import { TableOfContents } from '@/components/markdown/toc'
import { extractVideosFromContent, formatDate, getPost } from '@/lib/blog'
import { SITE_DOMAIN } from '@/lib/config'
import { staticAsset } from '@/lib/staticAsset'
import { extractToc } from '@/lib/toc'

export const revalidate = 0 // Disable caching so each refresh fetches the latest data.

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  // Prefer SEO fields from the API, falling back to title and description.
  const title = post.frontmatter.seo?.title ?? post.frontmatter.title
  const description = post.frontmatter.seo?.description ?? post.frontmatter.description
  const canonicalUrl = `${SITE_DOMAIN}/blog/${slug}`
  const imageUrl = post.frontmatter.imagePath
  return {
    title,
    description,
    ...(post.frontmatter.seo?.keywords?.length && {
      keywords: post.frontmatter.seo.keywords
    }),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      siteName: 'AIPOCH',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] })
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AIPOCH_AI',
      creator: '@AIPOCH_AI',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] })
    },
    ...(imageUrl && {
      other: {
        thumbnail: imageUrl
      }
    })
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const toc = await extractToc(post.content)
  const prev = post.previousPost
  const next = post.nextPost

  const baseUrl = `${SITE_DOMAIN}/blog/${slug}`
  const ogImage = staticAsset('og-bfe41bdd.webp')
  const schemaTitle = post.frontmatter.seo?.title ?? post.frontmatter.title
  const schemaDescription = post.frontmatter.seo?.description ?? post.frontmatter.description
  const schemaImage = post.frontmatter.imagePath

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: schemaTitle,
    description: schemaDescription,
    mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
    image: schemaImage,
    author: { '@type': 'Organization', name: post.frontmatter.author, url: SITE_DOMAIN },
    publisher: {
      '@type': 'Organization',
      name: 'AIPOCH',
      logo: { '@type': 'ImageObject', url: ogImage }
    },
    url: baseUrl,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    articleSection: post.frontmatter.category,
    wordCount: post.content.split(/\s+/).length
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: schemaTitle,
    description: schemaDescription,
    image: schemaImage,
    author: { '@type': 'Organization', name: post.frontmatter.author, url: SITE_DOMAIN },
    publisher: {
      '@type': 'Organization',
      name: 'AIPOCH',
      logo: { '@type': 'ImageObject', url: ogImage }
    },
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl }
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': baseUrl,
    url: baseUrl,
    name: schemaTitle,
    description: schemaDescription,
    datePublished: post.frontmatter.date,
    primaryImageOfPage: { '@type': 'ImageObject', url: schemaImage },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.markdown-body p']
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_DOMAIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_DOMAIN}/blog` },
        { '@type': 'ListItem', position: 3, name: schemaTitle, item: baseUrl }
      ]
    }
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_DOMAIN}/#organization`,
    name: 'AIPOCH',
    url: SITE_DOMAIN,
    logo: { '@type': 'ImageObject', url: ogImage }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_DOMAIN },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_DOMAIN}/blog` },
      { '@type': 'ListItem', position: 3, name: schemaTitle, item: baseUrl }
    ]
  }

  const schemas: Record<string, unknown>[] = [
    blogPostingSchema,
    articleSchema,
    webPageSchema,
    organizationSchema,
    breadcrumbSchema
  ]

  if (post.frontmatter.faqs?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.frontmatter.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    })
  }

  const videoSources = post.frontmatter.videos?.length
    ? post.frontmatter.videos.map((v) => ({
        contentUrl: v.contentUrl ?? '',
        thumbnailUrl: v.thumbnailUrl ?? ogImage,
        name: v.name,
        description: v.description ?? post.frontmatter.description,
        uploadDate: v.uploadDate ?? post.frontmatter.date
      }))
    : extractVideosFromContent(post.content).map((v) => ({
        contentUrl: v.contentUrl,
        thumbnailUrl: v.thumbnailUrl ?? ogImage,
        name: v.name ?? post.frontmatter.title,
        description: post.frontmatter.description,
        uploadDate: post.frontmatter.date
      }))

  for (const video of videoSources) {
    if (video.contentUrl) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.name,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        uploadDate: video.uploadDate,
        contentUrl: video.contentUrl
      })
    }
  }

  const imageUrls =
    post.frontmatter.images?.map((img) => ({
      url: img.url,
      caption: img.caption
    })) ??
    [...post.content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({
      url: m[2],
      caption: (m[1] as string) || undefined
    }))

  if (imageUrls.length) {
    for (const img of imageUrls) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        contentUrl: img.url,
        caption: img.caption
      })
    }
  }

  const formattedDate = formatDate(post.frontmatter.date)

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="px-4 pt-12 pb-22 lg:pb-32">
        <div className="mx-auto max-w-4xl xl:max-w-5xl">
          <JsonLd data={schemas} />

          {/* Back to Blog */}
          <Link
            href="/blog"
            scroll={false}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <div className="flex flex-col xl:flex-row xl:gap-4 xl:items-start xl:justify-center">
            <div className="min-w-0 w-full max-w-3xl mx-auto xl:pr-4">
              <nav
                className="bg-[#d0e6f7]/40 border border-[#a8cce8] rounded-none px-4 py-1.5 mb-8 font-mono"
                aria-label="Breadcrumb"
              >
                <span className="flex items-baseline flex-wrap gap-x-2 text-xs font-medium uppercase tracking-widest">
                  <Link href="/" className="text-gray-500 hover:text-black transition-colors">
                    HOME
                  </Link>
                  <span className="text-gray-400">/</span>
                  <Link href="/blog" className="text-gray-500 hover:text-black transition-colors">
                    BLOG
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 truncate max-w-[200px] md:max-w-md min-w-0">
                    {post.frontmatter.title.toUpperCase()}
                  </span>
                </span>
              </nav>

              {/* Main content on a white background. */}
              <div className="bg-white rounded-none shadow-sm">
                <article>
                  {/* Article Header */}
                  <header className="p-6 md:p-8 pb-0">
                    <div className="flex items-center gap-2 text-[#ea580c] font-mono text-xs font-bold uppercase leading-none tracking-widest mb-4">
                      <Clock size={14} />
                      <span className="leading-none mt-0.5">{post.frontmatter.readTime}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl mb-4 leading-snug font-bold">
                      {post.frontmatter.seo?.h1 ?? post.frontmatter.title}
                    </h1>
                    <p className="text-gray-600 mb-6 font-serif">{post.frontmatter.description}</p>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        {post.frontmatter.author}
                      </span>
                      <span className="text-sm font-mono text-gray-500">{formattedDate}</span>
                    </div>
                  </header>

                  {/* Article content divider. */}
                  <hr className="border-t border-gray-200 mx-6 md:mx-8 my-0" />

                  {/* Article Content */}
                  <div className="p-6 md:p-8 pt-6">
                    <MarkdownRenderer content={post.content} mode="md" />
                  </div>

                  {/* Prev/Next Navigation */}
                  <nav className="mt-12 pt-8 border-t border-gray-200 px-6 md:px-8 pb-6 md:pb-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {prev ? (
                        <Link
                          href={`/blog/${prev.slug}`}
                          className="flex-1 group p-4 rounded-none border border-gray-200 hover:border-gray-300 hover:bg-gray-200 transition-all"
                        >
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                            Previous Article
                          </p>
                          <p className="font-medium flex items-center gap-2 min-w-0">
                            <ArrowLeft size={16} className="shrink-0" />{' '}
                            <span className="line-clamp-2">{prev.title}</span>
                          </p>
                        </Link>
                      ) : (
                        <div className="flex-1" />
                      )}
                      {next ? (
                        <Link
                          href={`/blog/${next.slug}`}
                          className="flex-1 group p-4 rounded-none border border-gray-200 hover:border-gray-300 hover:bg-gray-200 transition-all sm:text-right"
                        >
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                            Next Article
                          </p>
                          <p className="font-medium flex items-center justify-end gap-2 sm:justify-end min-w-0">
                            <span className="line-clamp-2 text-right">{next.title}</span>{' '}
                            <ArrowRight size={16} className="shrink-0" />
                          </p>
                        </Link>
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>
                  </nav>
                </article>
              </div>
            </div>

            <aside className="hidden xl:block xl:w-72 shrink-0 xl:ml-2 xl:self-stretch">
              <div className="sticky top-58 w-72 space-y-6">
                <TableOfContents
                  toc={toc}
                  className="border border-black/10 bg-white rounded-none p-4"
                />
                <BlogSidebarCTA />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
