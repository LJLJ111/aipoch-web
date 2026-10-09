import { expect, test } from '@playwright/test'

test('guides retain the index redirect, modules, section anchors and adjacent navigation', async ({
  page,
  isMobile
}) => {
  await page.goto('/guides/')
  await expect(page).toHaveURL(/\/guides\/what-is-a-skill$/)
  await expect(page.getByRole('heading', { name: 'What Is a Skill?', exact: true })).toBeVisible()
  const reject = page.getByRole('button', { name: 'Reject non-essential', exact: true })
  if (await reject.isVisible()) await reject.click()

  if (!isMobile) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await expect(page.getByRole('link', { name: /What Is a Skill\?/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
    const toc = page.getByRole('navigation', { name: 'On this page' })
    await toc.getByRole('link', { name: 'What a Skill contains' }).click()
    await expect(page).toHaveURL(/#heading-what-a-skill-contains$/)
    await expect(page.locator('#heading-what-a-skill-contains')).toBeInViewport()
  }

  await expect(page.getByText('Portability is key', { exact: true })).toBeAttached()
  await page
    .getByRole('navigation', { name: 'Adjacent guides' })
    .getByRole('link', { name: /Get Started with Skills/ })
    .click()
  await expect(page).toHaveURL(/\/guides\/get-started-with-skills$/)
  await page
    .getByRole('navigation', { name: 'Adjacent guides' })
    .getByRole('link', { name: /Build Your Own Skill/ })
    .click()
  await expect(page).toHaveURL(/\/guides\/build-your-own-skill$/)
  await expect(
    page.getByRole('heading', { name: 'Build Your Own Skill', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Adjacent guides' }).getByRole('link')
  ).toHaveCount(1)
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await page.getByRole('navigation', { name: 'Adjacent guides' }).getByRole('link').click()
  await expect(page).toHaveURL(/\/guides\/get-started-with-skills$/)
})
