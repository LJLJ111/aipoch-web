import { PolicyDocumentPage } from '@/app/(commonLayout)/components/policy-document-page'
import { SITE_DOMAIN } from '@/lib/config'
import { createPageMetadata } from '@/lib/page-metadata'
import { getPolicyDocument } from '@/lib/policy'

export const metadata = createPageMetadata({
  title: 'Terms of Service | AIPOCH',
  description:
    'Please read these Terms of Service carefully before using AIPOCH products and services.',
  canonical: `${SITE_DOMAIN}/terms-of-service`
})

export default async function TermsOfServicePage() {
  const policy = await getPolicyDocument({
    slug: 'terms-of-service',
    title: 'Terms of Service'
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
