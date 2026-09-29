import { PolicyDocumentPage } from '@/app/(commonLayout)/components/policy-document-page'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { getPolicyDocument } from '@/lib/policy'

export const metadata = createPageMetadata({
  title: 'Cookie Policy | AIPOCH',
  description:
    'This Cookie Policy describes what kinds of cookies and similar technologies AIPOCH uses in connection with our Services, and how you can manage them.',
  canonical: `${SITE_DOMAIN}/cookie-policy`
})

export default async function CookiePolicyPage() {
  const policy = await getPolicyDocument({
    slug: 'cookie-policy',
    title: 'Cookie Policy'
  })
  const facts = [{ label: 'Updated', value: policy.frontmatter.updated }]

  return (
    <PolicyDocumentPage
      title={policy.title}
      description={policy.frontmatter.description}
      content={policy.content}
      facts={facts}
    />
  )
}
