import { PolicyDocumentPage } from '@/app/(commonLayout)/components/policy-document-page'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { getPolicyDocument } from '@/lib/policy'

export const metadata = createPageMetadata({
  title: 'Privacy Policy | AIPOCH',
  description:
    'Learn how AIPOCH collects, uses, shares, protects, and retains personal data when you use our Services.',
  canonical: `${SITE_DOMAIN}/privacy-policy`
})

export default async function PrivacyPolicyPage() {
  const policy = await getPolicyDocument({
    slug: 'privacy-policy',
    title: 'Privacy Policy'
  })
  const facts = [
    { label: 'Updated', value: policy.frontmatter.updated },
    { label: 'Effective', value: policy.frontmatter.effective }
  ]

  return (
    <PolicyDocumentPage
      title={policy.title}
      description={policy.frontmatter.description}
      content={policy.content}
      facts={facts}
    />
  )
}
