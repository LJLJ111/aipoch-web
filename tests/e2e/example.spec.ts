import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('homepage renders local AIPOCH content', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Science, Open to All/i })).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'The AIPOCH Ecosystem for Scientific AI Workflows'
    })
  ).toBeVisible()
})
