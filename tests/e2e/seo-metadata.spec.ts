import { expect, test } from '@playwright/test'

const expectMetadata = async (
  page: import('@playwright/test').Page,
  expected: { title: string; description: string; canonical: string }
) => {
  await expect(page).toHaveTitle(expected.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    expected.description
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expected.canonical)
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', expected.title)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    expected.description
  )
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    'content',
    expected.title
  )
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
    'content',
    expected.description
  )
}

test('Contact page owns its metadata instead of inheriting the homepage fallback', async ({
  page
}) => {
  await page.goto('/contact-us')

  await expectMetadata(page, {
    title: 'Contact AIPOCH | Product, Support, and Partnership Inquiries',
    description: 'Contact AIPOCH about product support, partnerships, or media inquiries.',
    canonical: 'https://aipoch.com/contact-us'
  })
})

test('Blog page publishes the requested metadata and visible description', async ({ page }) => {
  await page.goto('/blog')
  const description =
    'Explore AIPOCH Open-Science product updates, research workflows, and practical insights for reproducible AI-assisted scientific research.'

  await expectMetadata(page, {
    title: 'AIPOCH Blog | Open-Science Updates & Research Workflows',
    description,
    canonical: 'https://aipoch.com/blog'
  })
  await expect(page.getByText(description, { exact: true })).toBeVisible()
})

test('Skills List shows the requested research workflow description', async ({ page }) => {
  await page.goto('/agent-skills/list')

  await expect(
    page.getByText(
      'Browse all medical research skills across Academic Writing, Data Analysis, Evidence Insights, Protocol Design, and other scientific research workflows.',
      { exact: true }
    )
  ).toBeVisible()
})
