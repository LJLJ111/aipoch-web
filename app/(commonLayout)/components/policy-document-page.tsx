import type { MDXComponents } from 'next-mdx-remote-client/rsc'
import { MarkdownRenderer } from '@/components/markdown'
import { TableOfContents } from '@/components/markdown/toc'
import { policyMdxComponents } from '@/components/policy/policy-mdx-components'
import { extractToc } from '@/lib/toc'

export type PolicyFact = {
  label: string
  value?: string
}

interface PolicyDocumentPageProps {
  title: string
  description?: string
  content: string
  facts?: PolicyFact[]
  tocClassName?: string
  mdxComponents?: MDXComponents
}

export async function PolicyDocumentPage({
  title,
  description,
  content,
  facts = [],
  tocClassName = 'border border-black/10 bg-white p-4 rounded-none',
  mdxComponents = policyMdxComponents
}: PolicyDocumentPageProps) {
  const toc = await extractToc(content)

  return (
    <main className="policy-document-page flex-1 bg-[#e8e8e8]">
      <section className="border-b border-black/10 bg-[#e8e8e8] bg-[linear-gradient(rgba(0,0,0,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.055)_1px,transparent_1px)] bg-size-[72px_72px]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:px-8 lg:py-20">
          <div>
            <h1 className="max-w-3xl mb-8 text-5xl font-bold leading-none tracking-normal text-black md:text-7xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-6 max-w-2xl text-sm leading-7 text-black/65 md:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {facts.length > 0 ? (
            <dl
              aria-label="Policy facts"
              className="rounded-none border border-black/10 bg-white p-5"
            >
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-4 border-b border-black/10 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[104px_1fr]"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-black/45">
                    {fact.label}
                  </dt>
                  <dd className="text-sm leading-6 text-black">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <section className="bg-[#e8e8e8] px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <TableOfContents toc={toc} className={tocClassName} />
          </aside>
          <article className="min-w-0 border border-black/10 bg-white px-6 pb-6 md:px-8 md:pb-8">
            <MarkdownRenderer content={content} components={mdxComponents} />
          </article>
        </div>
      </section>
    </main>
  )
}
