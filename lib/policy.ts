import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const POLICY_DIR = path.join(process.cwd(), 'data/policy')

export type PolicyFrontmatter = {
  title?: string
  description?: string
  updated?: string
  effective?: string
  inventorySource?: string
  scope?: string
}

export type PolicyDocument = {
  frontmatter: PolicyFrontmatter
  title: string
  content: string
}

interface PolicyDocumentOptions {
  slug: string
  title: string
}

// Keep policy content in MDX; the page handles the TOC and component mappings so legal copy can be updated independently.
export const getPolicyDocument = async ({
  slug,
  title
}: PolicyDocumentOptions): Promise<PolicyDocument> => {
  const filePath = path.join(POLICY_DIR, `${slug}.mdx`)
  const raw = await fs.readFile(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    frontmatter: data as PolicyFrontmatter,
    title,
    content: content.trim()
  }
}
