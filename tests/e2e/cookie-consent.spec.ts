import { expect, type Page, test } from '@playwright/test'

const preferenceStorageKey = 'aipoch_cookie_preferences'
const requiredAnalyticsEnv = {
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || 'G-TEST',
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || 'CLARITYTEST'
}

type CookiePreferences = {
  analytics: boolean
  embeddedMedia: boolean
}

type StoredCookiePreferences = CookiePreferences & {
  policyVersion?: string
  necessary?: boolean
  marketing?: boolean
  hasStoredChoice?: boolean
  pagePath?: string
  inventoryDate?: string
  updatedAt?: string
  expiresAt?: number
}

const clearCookiePreferences = async (page: Page) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((key) => localStorage.removeItem(key), preferenceStorageKey)
  await page.reload({ waitUntil: 'domcontentloaded' })
}

const getStoredPreferences = async (page: Page): Promise<StoredCookiePreferences> => {
  return page.evaluate((key) => {
    const rawPreferences = localStorage.getItem(key)

    if (!rawPreferences) {
      throw new Error(`Missing ${key} in localStorage`)
    }

    const parsedPreferences = JSON.parse(rawPreferences) as {
      state?: Partial<StoredCookiePreferences>
    }

    return {
      policyVersion: parsedPreferences.state?.policyVersion,
      necessary: parsedPreferences.state?.necessary,
      analytics: parsedPreferences.state?.analytics,
      embeddedMedia: parsedPreferences.state?.embeddedMedia,
      marketing: (parsedPreferences.state as Record<string, unknown>)?.marketing as boolean,
      hasStoredChoice: parsedPreferences.state?.hasStoredChoice,
      pagePath: (parsedPreferences.state as Record<string, unknown>)?.pagePath as string,
      inventoryDate: (parsedPreferences.state as Record<string, unknown>)?.inventoryDate as string,
      updatedAt: (parsedPreferences.state as Record<string, unknown>)?.updatedAt as string,
      expiresAt: (parsedPreferences.state as Record<string, unknown>)?.expiresAt as number
    } as StoredCookiePreferences
  }, preferenceStorageKey)
}

const expectStoredPreferences = async (page: Page, expected: CookiePreferences) => {
  await expect.poll(() => getStoredPreferences(page)).toMatchObject(expected)
}

const openFooterPrivacyChoices = async (page: Page) => {
  // A navigation commit can precede the reloaded document and its client scripts.
  await page.waitForLoadState('load')
  const dialog = page.getByRole('dialog', { name: 'Cookie Preferences' })

  // After a reload, the footer button can be visible before its client click handler is hydrated.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole('button', { name: 'Manage Cookies' }).click()

    try {
      await expect(dialog).toBeVisible({ timeout: 2000 })
      return
    } catch {
      await page.waitForTimeout(250)
    }
  }

  await expect(dialog).toBeVisible()
}

const countGoogleAnalyticsConfigCalls = async (page: Page) => {
  return page.evaluate((googleAnalyticsId) => {
    const getGtagCommand = (entry: unknown) => {
      if (Array.isArray(entry)) return entry

      if (
        entry &&
        typeof entry === 'object' &&
        'length' in entry &&
        typeof (entry as { length?: unknown }).length === 'number'
      ) {
        return Array.from(entry as ArrayLike<unknown>)
      }

      return []
    }

    return (window.dataLayer || []).filter((entry) => {
      const command = getGtagCommand(entry)
      return command[0] === 'config' && command[1] === googleAnalyticsId
    }).length
  }, requiredAnalyticsEnv.googleAnalyticsId)
}

const mockGoogleTagManagerWithPageViewCollect = async (page: Page) => {
  await page.route('https://www.googletagmanager.com/gtag/js**', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        (() => {
          const measurementId = ${JSON.stringify(requiredAnalyticsEnv.googleAnalyticsId)};
          const dataLayer = window.dataLayer || [];

          const sendPageViewCollect = () => {
            const image = new Image();
            image.src = 'https://www.google-analytics.com/g/collect?v=2&tid='
              + encodeURIComponent(measurementId)
              + '&en=page_view';
          };

          const processCommand = (command) => {
            const gtagCommand = Array.from(command || []);

            if (gtagCommand[0] === 'event' && gtagCommand[1] === 'page_view') {
              sendPageViewCollect();
            }
          };

          dataLayer.forEach(processCommand);

          window.gtag = function() {
            dataLayer.push(arguments);
            processCommand(arguments);
          };
        })();
      `
    })
  })

  await page.route('https://www.google-analytics.com/g/collect**', async (route) => {
    await route.fulfill({ status: 204, body: '' })
  })
}

const waitForGoogleAnalyticsPageViewCollect = async (page: Page) => {
  return page.waitForRequest((request) => {
    if (!request.url().startsWith('https://www.google-analytics.com/g/collect')) {
      return false
    }

    const requestUrl = new URL(request.url())
    return (
      requestUrl.searchParams.get('tid') === requiredAnalyticsEnv.googleAnalyticsId &&
      requestUrl.searchParams.get('en') === 'page_view'
    )
  })
}

const mockPersistentClarityRuntimeWithCollects = async (page: Page) => {
  const collectRequests: string[] = []

  await page.route('https://www.clarity.ms/tag/**', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        (() => {
          const previousQueue = window.clarity?.q || [];

          const processCommand = (args) => {
            window.__aipochClarityCommands = window.__aipochClarityCommands || [];
            window.__aipochClarityCommands.push(Array.from(args || []));
          };

          previousQueue.forEach(processCommand);

          window.clarity = function() {
            processCommand(arguments);
          };

          window.__aipochClarityCollectInterval = window.setInterval(() => {
            const image = new Image();
            image.src = 'https://www.clarity.ms/collect?tick=' + Date.now();
          }, 150);
        })();
      `
    })
  })

  await page.route('https://www.clarity.ms/collect**', async (route) => {
    collectRequests.push(route.request().url())
    await route.fulfill({ status: 204, body: '' })
  })

  return collectRequests
}

test.describe('cookie consent', () => {
  test.describe.configure({ mode: 'serial', timeout: 60000 })

  test.beforeEach(async ({ page }) => {
    await clearCookiePreferences(page)
  })

  test('shows the banner without loading analytics on first homepage visit', async ({ page }) => {
    await expect(page.getByRole('region', { name: /cookie/i })).toBeVisible()
    await expect(
      page.getByText(/We use necessary cookies and similar technologies required/)
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      '/cookie-policy'
    )
    await expect(page.locator('#aipoch-ga-script')).toHaveCount(0)
    await expect(page.locator('#aipoch-clarity-script')).toHaveCount(0)
  })

  test('keeps the homepage visible without loading analytics before hydration', async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto(`${baseURL}/`)
    await expect(page.getByRole('heading', { name: /Science, Open to All/i })).toBeVisible()
    await expect(page.locator('#aipoch-ga-script')).toHaveCount(0)
    await expect(page.locator('#aipoch-clarity-script')).toHaveCount(0)

    await context.close()
  })

  test('accepts all cookies and stores the complete preference choice', async ({ page }) => {
    await page.getByRole('button', { name: 'Accept all' }).click()

    await expect(page.getByRole('region', { name: /cookie/i })).toBeHidden()
    await expectStoredPreferences(page, {
      analytics: true,
      embeddedMedia: true
    })
    const stored = await getStoredPreferences(page)
    expect(stored.policyVersion).toBe('v2')
    expect(stored.necessary).toBe(true)
    expect(stored.hasStoredChoice).toBe(true)
    expect(stored.marketing).toBeUndefined()
    expect(stored.pagePath).toBeUndefined()
    expect(stored.inventoryDate).toBeUndefined()
    expect(stored.updatedAt).toBeUndefined()
    expect(stored.expiresAt).toBeUndefined()
  })

  test('rejects non-essential cookies without loading analytics', async ({ page }) => {
    await page.getByRole('button', { name: 'Reject non-essential' }).click()

    await expect(page.getByRole('region', { name: /cookie/i })).toBeHidden()
    await expectStoredPreferences(page, {
      analytics: false,
      embeddedMedia: false
    })
    await expect(page.locator('#aipoch-ga-script')).toHaveCount(0)
    await expect(page.locator('#aipoch-clarity-script')).toHaveCount(0)
  })

  test('saves managed analytics choice and loads analytics scripts', async ({ page }) => {
    await page.getByRole('button', { name: 'Manage choices' }).click()

    await expect(page.getByRole('dialog', { name: 'Cookie Preferences' })).toBeVisible()
    await expect(page.getByText(/Websites use cookies and other identifiers/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute(
      'href',
      '/cookie-policy'
    )
    await expect(page.getByRole('switch', { name: 'Necessary' })).toBeDisabled()
    await expect(page.getByRole('switch', { name: 'Necessary' })).toBeChecked()
    await expect(
      page.getByRole('switch', { name: 'Functional and embedded media cookies' })
    ).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Analytics cookies' })).toBeVisible()
    await expect(
      page.getByRole('switch', { name: 'Personalized media and marketing' })
    ).toHaveCount(0)

    await page.getByRole('switch', { name: 'Analytics cookies' }).click()
    await page.getByRole('button', { name: 'Save choices' }).click()

    await expect(page.getByRole('dialog', { name: 'Cookie Preferences' })).toBeHidden()
    await expectStoredPreferences(page, {
      analytics: true,
      embeddedMedia: false
    })
    await expect(page.locator('#aipoch-ga-script')).toBeAttached()
    await expect(page.locator('#aipoch-clarity-script')).toBeAttached()
  })

  test('sends a Google Analytics page view collect after analytics consent is accepted', async ({
    page
  }) => {
    await mockGoogleTagManagerWithPageViewCollect(page)
    const pageViewCollectRequest = waitForGoogleAnalyticsPageViewCollect(page)

    await page.getByRole('button', { name: 'Accept all' }).click()

    await expect(page.locator('#aipoch-ga-script')).toBeAttached()
    await pageViewCollectRequest
  })

  test('reconfigures Google Analytics after consent is rejected and accepted again', async ({
    page
  }) => {
    await page.getByRole('button', { name: 'Accept all' }).click()
    await expect(page.locator('#aipoch-ga-script')).toBeAttached()
    await expect.poll(() => countGoogleAnalyticsConfigCalls(page)).toBe(1)

    const pageReload = page.waitForEvent('framenavigated', {
      predicate: (frame) => frame === page.mainFrame()
    })
    await openFooterPrivacyChoices(page)
    await page.getByRole('button', { name: 'Reject non-essential' }).click()
    await pageReload
    await expect(page.locator('#aipoch-ga-script')).toHaveCount(0)

    await openFooterPrivacyChoices(page)
    await page.getByRole('button', { name: 'Accept all' }).click()
    await expect(page.locator('#aipoch-ga-script')).toBeAttached()

    await expect.poll(() => countGoogleAnalyticsConfigCalls(page)).toBe(1)
  })

  test('fully unloads Clarity runtime when analytics consent is withdrawn', async ({ page }) => {
    const clarityCollectRequests = await mockPersistentClarityRuntimeWithCollects(page)

    await page.getByRole('button', { name: 'Accept all' }).click()
    await expect(page.locator('#aipoch-clarity-script')).toBeAttached()
    await expect.poll(() => clarityCollectRequests.length).toBeGreaterThanOrEqual(2)

    const pageReload = page.waitForEvent('framenavigated', {
      predicate: (frame) => frame === page.mainFrame()
    })

    await openFooterPrivacyChoices(page)
    await page.getByRole('button', { name: 'Reject non-essential' }).click()
    await pageReload
    await expect(page.locator('#aipoch-clarity-script')).toHaveCount(0)
    await expectStoredPreferences(page, {
      analytics: false,
      embeddedMedia: false
    })

    const collectCountAfterReject = clarityCollectRequests.length
    await page.waitForTimeout(700)

    expect(clarityCollectRequests).toHaveLength(collectCountAfterReject)
  })

  test('keeps keyboard focus inside the cookie preferences dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Manage choices' }).click()
    const dialog = page.getByRole('dialog', { name: 'Cookie Preferences' })

    await expect(dialog).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null))
      .toBe(true)

    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press('Tab')
      await expect
        .poll(() =>
          page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)
        )
        .toBe(true)
    }
  })

  test('invalid policy version resets to defaults and shows the banner again', async ({ page }) => {
    await page.evaluate((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            policyVersion: 'v0',
            necessary: true,
            analytics: true,
            embeddedMedia: true,
            marketing: true,
            hasStoredChoice: true
          },
          version: 0
        })
      )
    }, preferenceStorageKey)

    await page.reload({ waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('region', { name: /cookie/i })).toBeVisible()
    await expect(page.locator('#aipoch-ga-script')).toHaveCount(0)
    await expect(page.locator('#aipoch-clarity-script')).toHaveCount(0)
  })

  test('reopens preferences from footer privacy choices after consent is handled', async ({
    page
  }) => {
    await page.getByRole('button', { name: 'Reject non-essential' }).click()
    await expect(page.getByRole('region', { name: /cookie/i })).toBeHidden()

    await openFooterPrivacyChoices(page)

    await expect(page.getByRole('dialog', { name: 'Cookie Preferences' })).toBeVisible()
    await page.getByRole('switch', { name: 'Functional and embedded media cookies' }).click()
    await page.getByRole('button', { name: 'Save choices' }).click()
    await expectStoredPreferences(page, {
      analytics: false,
      embeddedMedia: true
    })
  })

  test('renders footer privacy choices as the underlined legal action', async ({ page }) => {
    const footer = page.locator('footer')
    // Keep this assertion aligned with the footer business component; if copy drifts, the
    // component text is the source of truth.
    const privacyChoices = footer.getByRole('button', { name: 'Manage Cookies' })

    await expect(footer).toContainText(/© 2026 AIPOCH\. All Rights Reserved\.\s+Manage Cookies\./)
    await expect(footer).not.toContainText('AIPOCH Intelligence')
    await expect(privacyChoices).toHaveCSS('text-decoration-line', /underline/)
  })

  test('renders the cookie policy page', async ({ page }) => {
    await page.goto('/cookie-policy', { waitUntil: 'domcontentloaded' })
    await page.evaluate((key) => localStorage.removeItem(key), preferenceStorageKey)
    await page.reload({ waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: 'Cookie Policy' })).toBeVisible()
    await expect(
      page.getByText(
        'This Cookie Policy describes what kinds of cookies and similar technologies AIPOCH uses in connection with our Services, and how you can manage them.'
      )
    ).toBeVisible()
    await expect(page.getByRole('navigation', { name: /on this page/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Managing cookies' })).toBeVisible()
    // These document assertions mirror the current policy MDX; if content changes, the MDX
    // business copy is the source of truth.
    const policyFacts = page.getByLabel('Policy facts')
    const updatedLabel = policyFacts.getByText('Updated', { exact: true })
    const updatedValue = policyFacts.getByText('May 25, 2026', { exact: true })

    await expect(page.getByText('Updated', { exact: true })).toBeVisible()
    await expect(page.getByText('May 25, 2026', { exact: true })).toBeVisible()
    const labelBox = await updatedLabel.boundingBox()
    const valueBox = await updatedValue.boundingBox()
    expect(labelBox).not.toBeNull()
    expect(valueBox).not.toBeNull()
    expect(
      Math.abs(
        (labelBox?.y ?? 0) +
          (labelBox?.height ?? 0) / 2 -
          ((valueBox?.y ?? 0) + (valueBox?.height ?? 0) / 2)
      )
    ).toBeLessThanOrEqual(2)
    await expect(page.getByText('Inventory source', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Policy scope', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Necessary cookies' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Analytics cookies' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Functional and embedded media cookies' })
    ).toBeVisible()
    await expect(page.getByText('_ga_5QRMVQZ5K2', { exact: true })).toBeVisible()
    await expect(page.getByText('ANON', { exact: true })).toBeVisible()
    await expect(page.getByText('SID', { exact: true })).toBeVisible()
    await expect(page.getByText('__Secure-3PSIDTS', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Not detected in the May 6, 2026 scan')).toHaveCount(0)
    await expect(page.locator('table').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Google Analytics opt-out/i })).toBeVisible()
  })
})
