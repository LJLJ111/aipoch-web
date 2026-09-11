import { BlogListClient } from '@/components/blog-list-client'
import { JsonLd } from '@/components/json-ld'
import { getPostsForListPage, mapListItemToBlogPost } from '@/lib/blog'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { staticAsset } from '@/lib/staticAsset'

export const revalidate = 0 // Disable caching so each refresh fetches the latest data.

const BLOG_TITLE = 'AIPOCH Blog | Open-Science Updates & Research Workflows'
const BLOG_DESCRIPTION =
  'Explore AIPOCH Open-Science product updates, research workflows, and practical insights for reproducible AI-assisted scientific research.'

export const metadata = createPageMetadata({
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  canonical: `${SITE_DOMAIN}/blog`
})

export default async function BlogPage() {
  // Fetch the first page on the server and load subsequent pages on scroll.
  const firstPageData = await getPostsForListPage(1, 21)
  const posts = firstPageData.items.map(mapListItemToBlogPost)

  const ogImage = staticAsset('og-bfe41bdd.webp')

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: firstPageData.total,
    itemListElement: posts.map((post, index) => {
      const schemaTitle = post.frontmatter.seo?.title ?? post.frontmatter.title
      const schemaDescription = post.frontmatter.seo?.description ?? post.frontmatter.description
      const schemaImage = post.frontmatter.imagePath ?? ogImage
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          '@id': `${SITE_DOMAIN}/blog/${post.slug}`,
          name: schemaTitle,
          description: schemaDescription,
          image: schemaImage,
          url: `${SITE_DOMAIN}/blog/${post.slug}`,
          datePublished: post.frontmatter.date,
          author: { '@type': 'Organization', name: post.frontmatter.author, url: SITE_DOMAIN },
          publisher: {
            '@type': 'Organization',
            name: 'AIPOCH',
            logo: { '@type': 'ImageObject', url: ogImage }
          }
        }
      }
    })
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_DOMAIN },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_DOMAIN}/blog` }
    ]
  }

  return (
    <main className="w-full max-w-7xl mx-auto min-w-0 px-4 pt-12 pb-22 lg:pb-32 flex-1">
      <JsonLd data={[itemListSchema, breadcrumbSchema]} />
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Blog</h1>
        <p className="text-gray-500 text-lg font-mono italic">{BLOG_DESCRIPTION}</p>
      </header>

      <BlogListClient initialData={{ pages: [firstPageData], pageParams: [1] }} />
    </main>
  )
}
