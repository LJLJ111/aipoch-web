import { expect, test } from '@playwright/test'

test('MedFlow success state truncates long display names inside the waitlist card', async ({
  page,
  isMobile
}) => {
  test.skip(!isMobile, 'the reported layout regression is mobile-specific')

  await page.route('**/api/v1/members', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 20000,
        msg: 'Success',
        data: { message: 'Email reserved.' }
      })
    })
  })

  await page.goto('/medflow')

  await page.getByLabel('Your name').fill('220986544444444444444444444444444444444')
  await page.getByLabel('Email address').fill('long-name@example.com')
  await page.getByLabel(/You hereby acknowledge and agree/).check()
  await page.locator('#mf-btn').click()

  const successCard = page.locator('#waitlist')
  const successTitle = page.locator('#mf-success-title')
  const successPrefix = page.locator('.mf-success-prefix')
  const successName = page.locator('.mf-success-name')
  const successSuffix = page.locator('.mf-success-suffix')

  await expect(successTitle).toBeVisible()
  await expect(successPrefix).toHaveText("You're in,\u00a0")
  await expect(successSuffix).toHaveText('!')
  await expect(successTitle).toContainText('220986544444444444444444444444444444444')

  const bounds = await successName.evaluate((name) => {
    const title = name.closest('#mf-success-title')
    const prefix = title?.querySelector('.mf-success-prefix')
    const suffix = title?.querySelector('.mf-success-suffix')
    const titleBox = title?.getBoundingClientRect()
    const prefixBox = prefix?.getBoundingClientRect()
    const nameBox = name.getBoundingClientRect()
    const suffixBox = suffix?.getBoundingClientRect()
    const cardBox = title?.closest('#waitlist')?.getBoundingClientRect()

    if (!titleBox || !prefixBox || !suffixBox || !cardBox) {
      throw new Error('Missing success title layout element')
    }

    return {
      titleLeft: titleBox.left,
      titleRight: titleBox.right,
      prefixLeft: prefixBox.left,
      prefixRight: prefixBox.right,
      nameLeft: nameBox.left,
      nameRight: nameBox.right,
      suffixLeft: suffixBox.left,
      suffixRight: suffixBox.right,
      cardLeft: cardBox.left,
      cardRight: cardBox.right,
      nameScrollWidth: name.scrollWidth,
      nameClientWidth: name.clientWidth
    }
  })

  await expect(successCard).toBeVisible()
  expect(bounds.titleLeft).toBeGreaterThanOrEqual(bounds.cardLeft)
  expect(bounds.titleRight).toBeLessThanOrEqual(bounds.cardRight)
  expect(bounds.prefixLeft).toBeGreaterThanOrEqual(bounds.cardLeft)
  expect(bounds.prefixRight).toBeLessThanOrEqual(bounds.cardRight)
  expect(bounds.nameLeft).toBeGreaterThanOrEqual(bounds.cardLeft)
  expect(bounds.nameRight).toBeLessThanOrEqual(bounds.cardRight)
  expect(bounds.suffixLeft).toBeGreaterThanOrEqual(bounds.cardLeft)
  expect(bounds.suffixRight).toBeLessThanOrEqual(bounds.cardRight)
  expect(bounds.nameScrollWidth).toBeGreaterThan(bounds.nameClientWidth)
})
