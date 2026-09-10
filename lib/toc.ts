import { serialize } from 'next-mdx-remote-client/serialize'
import rehypeSlug from 'rehype-slug'
import remarkFlexibleToc from 'remark-flexible-toc'

export interface TocItem {
  value: string
  href: string
  depth: number
}

export const MARKDOWN_HEADING_ID_PREFIX = 'heading-'

export async function extractToc(content: string): Promise<TocItem[]> {
  const result = await serialize({
    source: content,
    options: {
      mdxOptions: {
        remarkPlugins: [[remarkFlexibleToc, { prefix: MARKDOWN_HEADING_ID_PREFIX }]],
        rehypePlugins: [[rehypeSlug, { prefix: MARKDOWN_HEADING_ID_PREFIX }]],
        // Published content is rendered as Markdown, so TOC extraction must parse the same format.
        format: 'md'
      },
      parseFrontmatter: true,
      vfileDataIntoScope: 'toc'
    }
  })

  return (result.scope?.toc as TocItem[]) || []
}
