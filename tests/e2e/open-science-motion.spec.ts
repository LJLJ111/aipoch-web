import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/open-science/app/stable/version.json', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' })
  )
})

test('reveals content on entry without replaying when revisiting a module', async ({ page }) => {
  await page.goto('/open-science')
  const card = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Anthropic', exact: true }) })
  await card.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect
    .poll(() => card.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0)
  const frame = await card.evaluate((element) => {
    for (const animation of element.getAnimations()) {
      animation.pause()
      animation.currentTime = 180
    }
    const styles = getComputedStyle(element)
    return { opacity: Number(styles.opacity), transform: styles.transform }
  })
  expect(frame.opacity).toBeGreaterThan(0)
  expect(frame.opacity).toBeLessThan(1)
  expect(frame.transform).not.toBe('none')
  await card.evaluate((element) => {
    for (const animation of element.getAnimations()) animation.finish()
  })
  await expect(card).toHaveCSS('opacity', '1')
  await expect(card).toHaveCSS('transform', 'none')
  await page.locator('h1').scrollIntoViewIfNeeded()
  await card.scrollIntoViewIfNeeded()
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0)

  for (const section of await page.locator('main > section').all()) {
    expect(await section.locator('[data-open-science-reveal]').count()).toBeGreaterThan(0)
  }
})

test('shows all content immediately with reduced motion and without JavaScript', async ({
  page,
  browser
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/open-science')
  const targets = page.locator('[data-open-science-reveal]')
  expect(await targets.count()).toBeGreaterThan(20)
  await page.locator('footer').scrollIntoViewIfNeeded()
  expect(
    await targets.evaluateAll((elements) =>
      elements.every((element) => {
        const style = getComputedStyle(element)
        return (
          style.opacity === '1' &&
          style.transform === 'none' &&
          element.getAnimations().length === 0
        )
      })
    )
  ).toBe(true)

  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const noScript = await context.newPage()
    await noScript.goto(new URL('/open-science', page.url()).href)
    await expect(noScript.locator('h1')).toBeVisible()
    const staticTargets = noScript.locator('[data-open-science-reveal]')
    expect(await staticTargets.count()).toBeGreaterThan(20)
    expect(
      await staticTargets.evaluateAll((elements) =>
        elements.every((element) => {
          const style = getComputedStyle(element)
          return style.opacity === '1' && style.transform === 'none'
        })
      )
    ).toBe(true)
  } finally {
    await context.close()
  }
})

test('finishes reveals when motion is reduced or a link receives keyboard focus', async ({
  page
}) => {
  await page.goto('/open-science')
  const card = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Anthropic', exact: true }) })
  await card.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect
    .poll(() => card.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(card).toHaveCSS('opacity', '1')
  await expect(card).toHaveCSS('transform', 'none')
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.reload()
  const link = page.getByRole('link', { name: 'Join the Discord', exact: true })
  const revealedParent = link.locator('xpath=ancestor-or-self::*[@data-open-science-reveal][1]')
  await revealedParent.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' })
  )
  await expect
    .poll(() => revealedParent.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0)
  await link.focus()
  await expect(link).toBeFocused()
  await expect(revealedParent).toHaveCSS('opacity', '1')
  await expect(revealedParent).toHaveCSS('transform', 'none')
  expect(await revealedParent.evaluate((element) => element.getAnimations().length)).toBe(0)
})
