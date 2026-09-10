import type { Metadata } from 'next'
import { PolicyDocumentPage } from '@/app/(commonLayout)/components/policy-document-page'
import { getPolicyDocument } from '@/lib/policy'

export const metadata: Metadata = {
  title: 'Cookie Policy | AIPOCH',
  description:
    'This Cookie Policy describes what kinds of cookies and similar technologies AIPOCH uses in connection with our Services, and how you can manage them.'
}

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
