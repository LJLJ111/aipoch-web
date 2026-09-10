import { expect, type Page, test } from '@playwright/test'
import {
  homepageOpenScienceConfigFixture,
  homepageReadWatchFixture,
  homepageSkillsCountFixture
} from './homepage-e2e-fixtures'

test('redirects the www host to the canonical origin with HTTP 301', async ({
  request,
  baseURL
}) => {
  if (!baseURL) throw new Error('Playwright baseURL is required for the redirect contract.')
  const response = await request.get(new URL('/geo-check?source=e2e', baseURL).toString(), {
    headers: { host: 'www.aipoch.com' },
    maxRedirects: 0
  })

  expect(response.status()).toBe(301)
  expect(response.headers().location).toBe('https://aipoch.com/geo-check?source=e2e')
})

const downloadManifestFixture = {
  version: '0.2.0',
  downloads: {
    'mac-arm64': {
      url: 'https://cdn.example.com/open-science-mac-arm64.dmg',
      size: 172885330
    },
    'mac-x64': {
      url: 'https://cdn.example.com/open-science-mac-x64.dmg',
      size: 180000000
    },
    'win-x64': {
      url: 'https://cdn.example.com/open-science-win-x64.exe',
      size: 140501246
    },
    'linux-x64-deb': {
      url: 'https://cdn.example.com/open-science-linux.deb',
      size: 145087720
    },
    'linux-x64-appimage': {
      url: 'https://cdn.example.com/open-science-linux.AppImage',
      size: 150000000
    }
  }
}

const GITHUB_REPOSITORY_API_GLOB =
  'https://api.github.com/repos/aipoch/open-science?homepage_load=*'

async function mockOpenScienceDownloadManifest(page: Page) {
  // Client-side fetch; Playwright can intercept this CDN request.
  await page.route('**/open-science/app/stable/version.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(downloadManifestFixture)
    })
  })
}

const mockGithubStars = async (page: Page) => {
  // Client-side fetch; keep the homepage suite independent from GitHub availability and rate limits.
  await page.route(GITHUB_REPOSITORY_API_GLOB, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ stargazers_count: 3600 })
    })
  })
}

test.beforeEach(async ({ page }) => {
  // Spotlight data is mocked in-process via E2E_HOMEPAGE_MOCK on the Next server
  // (Playwright page.route cannot intercept RSC server-side fetch).
  await mockOpenScienceDownloadManifest(page)
  await mockGithubStars(page)
  await page.goto('/')
})

test('refreshes GitHub stars once per page load without polling', async ({ page }) => {
  // Finish the initial load before counting requests from the reloads below.
  await expect(page.getByTestId('home-github-stars')).toContainText('3.6K')
  let githubRequestCount = 0
  let githubStars = 4210
  const githubRequestMethods: string[] = []

  await page.unroute(GITHUB_REPOSITORY_API_GLOB)
  await page.route(GITHUB_REPOSITORY_API_GLOB, async (route) => {
    githubRequestMethods.push(route.request().method())
    if (route.request().method() !== 'GET') {
      await route.fulfill({ status: 204 })
      return
    }
    githubRequestCount += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ stargazers_count: githubStars })
    })
  })

  await page.reload()
  await expect(page.getByTestId('home-github-stars')).toContainText('4.2K')
  expect(githubRequestCount).toBe(1)
  expect(githubRequestMethods).toEqual(['GET'])

  await page.waitForTimeout(1_000)
  expect(githubRequestCount).toBe(1)

  githubStars = 4380
  await page.reload()
  await expect(page.getByTestId('home-github-stars')).toContainText('4.4K')
  expect(githubRequestCount).toBe(2)
  expect(githubRequestMethods).toEqual(['GET', 'GET'])
})

test('renders the new homepage inside the existing shared layout', async ({ page }) => {
  const homepage = page.locator('[data-homepage="aipoch-open-science"]')

  await expect(homepage).toBeVisible()
  await expect(page.getByRole('banner')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await expect(homepage.locator('.topbar, .progress, .secidx')).toHaveCount(0)

  await expect(page.getByTestId('spotlight-title')).toBeVisible()

  for (const name of [
    'The AIPOCH Ecosystem for Scientific AI Workflows',
    'MedSkillAudit — every skill is audited before it ships',
    'Open, auditable, and yours to run.'
  ]) {
    const heading = page.getByRole('heading', { name })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
  }
})

test('keeps the download hero before the centered Open-Science release layout', async ({
  page
}) => {
  await expect(page.locator('#home-hero')).toBeVisible()

  const spotlightHeading = page.getByTestId('spotlight-title')
  await spotlightHeading.scrollIntoViewIfNeeded()
  await expect(spotlightHeading).toHaveCSS('font-weight', '800')
  await expect(spotlightHeading).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(spotlightHeading).toHaveCSS('text-align', 'center')

  const wikiCta = page.getByTestId('open-science-wiki-cta')
  await expect(wikiCta).toBeVisible()
  await expect(wikiCta).toHaveAttribute('href', 'https://aipoch.com/docs/')
  await expect(wikiCta.getByText('Open-Science Wiki')).toBeVisible()
  await expect(wikiCta.getByText('Open the Wiki')).toBeVisible()
  await expect(page.getByTestId('spotlight-media-full-width')).toBeVisible()

  await expect(page.getByTestId('hero-video')).toHaveCount(0)
  await expect(page.getByTestId('hero-insight')).toHaveCount(0)
  await expect(page.getByTestId('open-science-mark')).toHaveCount(0)
  await expect(page.getByTestId('hero-workbench-badge')).toHaveCount(0)
  await expect(page.getByTestId('homepage-marquee-primary')).toHaveCount(0)
  await expect(page.getByTestId('homepage-marquee-secondary')).toHaveCount(0)
  await expect(page.locator('[data-marquee-separator="true"]')).toHaveCount(0)
})

test('renders the product tour and CDN WebP screenshots', async ({ page }) => {
  const spotlight = page.locator('#open-science-spotlight')
  await expect(spotlight).toBeVisible()

  const productTour = homepageOpenScienceConfigFixture.media[0]
  if (!productTour) throw new Error('Product tour fixture missing')
  const productTourTab = page.getByRole('tab', { name: productTour.title })
  await productTourTab.scrollIntoViewIfNeeded()
  await expect(productTourTab).toHaveAttribute('aria-selected', 'true')

  const productTourFile = productTour.url.split('/').pop() ?? ''
  const productTourVideo = page.locator(`video[src*="${productTourFile}"]`)
  await productTourVideo.scrollIntoViewIfNeeded()
  await expect(productTourVideo).toBeVisible()
  await expect(productTourVideo).toHaveAttribute('preload', 'metadata')

  const screenshots = homepageOpenScienceConfigFixture.media
    .filter((item) => /\.(gif|jpe?g|png|webp)(?:[?#]|$)/i.test(item.url))
    .map((item) => {
      const fileName = item.url.split('/').pop() ?? ''
      return [item.title, new RegExp(fileName.replace('.', '\\.'))] as const
    })

  for (const [tabName, src] of screenshots) {
    const tab = page.getByRole('tab', { name: tabName })
    await tab.scrollIntoViewIfNeeded()
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('img', { name: tabName })).toHaveAttribute('src', src)
  }
})

test('hides the spotlight loader after rapidly switching between video tabs', async ({ page }) => {
  const productTour = homepageOpenScienceConfigFixture.media[0]
  const workflowVideo = homepageOpenScienceConfigFixture.media.find(
    (item) => item.title === 'Workflow demo'
  )
  if (!productTour || !workflowVideo) throw new Error('Video fixtures missing')

  const productTourTab = page.getByRole('tab', { name: productTour.title })
  const workflowVideoTab = page.getByRole('tab', { name: workflowVideo.title })
  await productTourTab.scrollIntoViewIfNeeded()

  for (let index = 0; index < 2; index += 1) {
    await workflowVideoTab.click()
    await productTourTab.click()
  }
  await workflowVideoTab.click()

  await expect(workflowVideoTab).toHaveAttribute('aria-selected', 'true')

  const workflowVideoFile = workflowVideo.url.split('/').pop() ?? ''
  await page.waitForFunction(
    (fileName) => {
      const video = document.querySelector(`video[src*="${fileName}"]`)
      const loading = document.querySelector('[data-testid="home-media-loading"]')
      const shell = loading?.parentElement?.parentElement
      if (!(video instanceof HTMLVideoElement) || !loading || !shell) return false

      const videoReady =
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ||
        (!video.paused && !video.ended && video.currentTime > 0)
      const loaderHidden =
        loading.getAttribute('aria-hidden') === 'true' &&
        getComputedStyle(shell).pointerEvents === 'none' &&
        Number(getComputedStyle(shell).opacity) < 0.05

      return videoReady && loaderHidden
    },
    workflowVideoFile,
    { timeout: 30000 }
  )
})

test('renders Read & watch items from the homepage API', async ({ page }) => {
  const first = homepageReadWatchFixture.items[0]
  if (!first) throw new Error('Read & watch fixture missing')
  const card = page.getByTestId('spotlight-read-watch')
  await card.scrollIntoViewIfNeeded()
  await expect(card.getByText(first.title)).toBeVisible()
  await expect(card.getByRole('link', { name: new RegExp(first.title, 'i') })).toHaveAttribute(
    'href',
    `/blog/${first.slug}`
  )
  await expect(card.getByText(first.category)).toBeVisible()
})

test('keeps the visible release snapshot aligned with v0.16.0', async ({ page }) => {
  await expect(page.getByText('Token usage dashboard', { exact: true })).toBeVisible()
  await expect(page.getByText('Composer message queue', { exact: true })).toBeVisible()
  await expect(page.getByText('Branch a conversation')).toHaveCount(0)
})

test('keeps ecosystem and provider switch copy aligned with the prototype', async ({ page }) => {
  const ecosystem = page.locator('#ecosystem')
  await ecosystem.scrollIntoViewIfNeeded()
  const ecosystemStates = [
    [
      'Open-Science',
      'Open-Science is an open-source, model-agnostic AI workbench for scientific discovery. Create a project, describe a task in plain language, and let the agent read files, run code, search the web, call scientific data connectors, and return reports, tables, figures, and an inspectable activity history in one workspace.'
    ],
    [
      'Medical Research Skills',
      `AIPOCH maintains a curated, open library of ${homepageSkillsCountFixture}+ reusable medical research skills spanning Evidence Insights, Protocol Design, Data Analysis, and Academic Writing — the four areas most research turns actually pass through.`
    ],
    [
      'MedSkillAudit',
      'MedSkillAudit is a domain-specific audit framework that decides whether a medical research agent skill is release-ready before deployment — governing scientific integrity, methodological soundness, reproducibility, and safety boundaries that general-purpose evaluation misses.'
    ]
  ] as const

  for (const [nodeName, copy] of ecosystemStates) {
    const node = ecosystem.getByRole('button', { name: new RegExp(nodeName) })
    await node.scrollIntoViewIfNeeded()
    await node.click()
    await expect(node).toHaveAttribute('aria-pressed', 'true')
    await expect(ecosystem.getByText(copy, { exact: true })).toBeVisible()
  }

  const openScience = page.locator('#open-science')
  await openScience.scrollIntoViewIfNeeded()
  const providers = [
    ['Claude Code', 'Claude Subscription'],
    ['OpenCode', 'Custom Gateway'],
    ['Codex', 'Codex Subscription']
  ] as const
  for (const [framework, provider] of providers) {
    await page.getByRole('button', { name: framework, exact: true }).click()
    await expect(page.getByText(provider, { exact: true })).toBeVisible()
  }
})

test('keeps every Open-Science preview caption and status from the prototype', async ({ page }) => {
  await page.locator('#open-science').scrollIntoViewIfNeeded()
  const previewPanel = page.getByTestId('open-science-preview')
  await previewPanel.scrollIntoViewIfNeeded()
  const previews = [
    ['Data', 'summary.csv · 1,284 rows × 6 columns', 'logged'],
    ['Documents', 'plan.md · document preview', 'gated by your approval'],
    ['Images', 'forest-plot.svg · meta-analysis figure', 'generated artifact'],
    ['Source', 'analysis.py · source preview', 'run with your approval'],
    ['Structures', 'structure.mol · 2D structure', 'molecular structures and reactions'],
    ['Notebook', 'notebook history · Python kernel', 'persists across restarts']
  ] as const

  for (const [tabName, caption, status] of previews) {
    const tab = page.getByRole('tab', { name: tabName })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(previewPanel.getByText(caption, { exact: true })).toBeVisible()
    await expect(previewPanel.getByText(status, { exact: true })).toBeVisible()
  }
})

test('uses direct Windows and Linux downloads with a macOS-only architecture menu', async ({
  page
}) => {
  // Resolve the initial manifest before counting the next document's request.
  await expect(
    page.getByTestId('home-platform-downloads').getByRole('link', { name: /Download Windows/i })
  ).toHaveAttribute('href', downloadManifestFixture.downloads['win-x64'].url)
  let manifestRequestCount = 0
  await page.unroute('**/open-science/app/stable/version.json')
  await page.route('**/open-science/app/stable/version.json', async (route) => {
    manifestRequestCount += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(downloadManifestFixture)
    })
  })
  await page.reload()

  const downloads = page.getByTestId('home-platform-downloads')
  await expect(downloads.getByRole('link', { name: /Download Windows/i })).toHaveAttribute(
    'href',
    downloadManifestFixture.downloads['win-x64'].url
  )
  await expect(downloads.getByRole('link', { name: /Download Linux/i })).toHaveAttribute(
    'href',
    downloadManifestFixture.downloads['linux-x64-deb'].url
  )
  await expect(downloads.getByText('DOWNLOAD', { exact: true })).toHaveCount(3)

  const macDownload = downloads.getByRole('button', { name: /Download macOS/i })
  await expect(macDownload).toHaveAttribute('aria-expanded', 'false')
  await macDownload.click()
  const macMenu = downloads.locator('#home-macos-downloads')
  await expect(macMenu.getByRole('link', { name: /Apple Silicon/i })).not.toHaveCSS(
    'background-color',
    'rgb(242, 242, 239)'
  )
  await expect(macMenu.getByRole('link', { name: /Apple Silicon/i })).toHaveAttribute(
    'href',
    downloadManifestFixture.downloads['mac-arm64'].url
  )
  await expect(macMenu.getByRole('link', { name: /Intel/i })).toHaveAttribute(
    'href',
    downloadManifestFixture.downloads['mac-x64'].url
  )
  expect(manifestRequestCount).toBe(1)
})

test('opens the macOS architecture menu on hover and closes after leaving it', async ({ page }) => {
  const downloads = page.getByTestId('home-platform-downloads')
  const macDownload = downloads.getByRole('button', { name: /Download macOS/i })
  const macMenu = downloads.locator('#home-macos-downloads')

  await expect(macMenu).toHaveCount(0)
  await macDownload.hover()
  await expect(macMenu).toBeVisible()

  await page.getByRole('heading', { name: /Science, Open to All/i }).hover()
  await expect(macMenu).toHaveCount(0)
})

test('keeps the macOS menu above the provider logo strip', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 })
  const downloads = page.getByTestId('home-platform-downloads')
  const macDownload = downloads.getByRole('button', { name: /Download macOS/i })
  const marquee = page.getByTestId('home-model-marquee')

  await macDownload.hover()
  const macMenu = downloads.locator('#home-macos-downloads')
  await expect(macMenu).toBeVisible()

  const [menuZIndex, marqueeZIndex] = await Promise.all([
    macMenu.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10)),
    marquee.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10))
  ])
  expect(menuZIndex).toBeGreaterThan(marqueeZIndex)
})

test('keeps at least thirty pixels above the provider strip at short desktop heights', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 700 })
  const githubBottom = await page
    .getByTestId('home-github-link')
    .evaluate((element) => element.getBoundingClientRect().bottom)
  const marqueeTop = await page
    .getByTestId('home-model-marquee')
    .evaluate((element) => element.getBoundingClientRect().top)

  expect(marqueeTop - githubBottom).toBeGreaterThanOrEqual(30)
})

test('does not introduce horizontal page overflow', async ({ page }) => {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  )

  expect(hasHorizontalOverflow).toBe(false)
})

test('keeps the first-paint navbar height stable after hydration', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(viewport)
    await page.reload()

    const metrics = await page.locator('[data-nav]').evaluate((header) => {
      const root = document.documentElement
      return {
        computedHeight: Number.parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')),
        headerHeight: header.getBoundingClientRect().height,
        inlineHeight: root.style.getPropertyValue('--nav-h')
      }
    })

    expect(metrics.computedHeight).toBeCloseTo(metrics.headerHeight, 0)
    expect(metrics.inlineHeight).toBe('')
  }
})

test('matches the first-screen vertical rhythm and opaque separated logo strip', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const heading = page.getByRole('heading', { name: /Science, Open to All/i })
  const marquee = page.getByTestId('home-model-marquee')

  await expect
    .poll(async () => heading.evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(297)
  await expect
    .poll(async () => heading.evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThanOrEqual(332)
  const githubBottom = await page
    .getByTestId('home-github-link')
    .evaluate((element) => element.getBoundingClientRect().bottom)
  const stats = page.getByTestId('home-hero-stats')
  await expect(stats).toBeVisible()
  await expect(stats.getByTestId('home-hero-stat-skills')).toHaveText(/597SKILLS/i)
  const statsTop = await stats.evaluate((element) => element.getBoundingClientRect().top)
  const statsBottom = await stats.evaluate((element) => element.getBoundingClientRect().bottom)
  const marqueeTop = await marquee.evaluate((element) => element.getBoundingClientRect().top)
  expect(statsTop - githubBottom).toBeCloseTo(48, 0)
  expect(marqueeTop - statsBottom).toBeCloseTo(64, 0)
  await expect(marquee).toHaveCSS('background-color', 'rgb(247, 247, 245)')
  await expect(marquee).toHaveCSS('border-top-color', 'rgb(232, 232, 227)')
  await expect(marquee).toHaveCSS('height', '72px')
  await expect(marquee).toHaveCSS('z-index', '20')
})

test('keeps the desktop architecture and hero type at fixed design sizes', async ({ page }) => {
  const architecture = page.getByTestId('home-hero-architecture')
  const heading = page.getByRole('heading', { name: /Science, Open to All/i })

  for (const width of [1440, 1920]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 1080 })
    await expect(architecture).toHaveCSS('background-size', '980px')
    await expect(heading).toHaveCSS('font-size', '100px')
    await expect(heading).toHaveCSS('font-weight', '400')
    await expect(heading).toHaveCSS('line-height', '79.56px')
  }
  await expect(architecture).toHaveCSS(
    'mask-image',
    /rgba\(0, 0, 0, 0\.08\) 26%.*rgb\(0, 0, 0\) 58%.*rgb\(0, 0, 0\) 100%/
  )
  await expect(architecture).toHaveCSS('opacity', '0.5')
  await expect(architecture).toHaveCSS('filter', /blur\(0.4px\)/)
  await page.setViewportSize({ width: 1440, height: 900 })
  const description = page.getByTestId('home-hero-description')
  await expect(description).toHaveCSS('font-size', '15px')
  expect(
    await description.evaluate((element) => {
      const style = getComputedStyle(element)
      return Math.round(
        element.getBoundingClientRect().height / Number.parseFloat(style.lineHeight)
      )
    })
  ).toBe(3)
})

test('aligns the hero with the page container and uses full-width shadow download cards', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const heroContent = page.getByTestId('home-hero-content')
  const navLogo = page.getByRole('link', { name: 'AIPOCH' }).first()
  const architecture = page.getByTestId('home-hero-architecture')
  const downloads = page.getByTestId('home-platform-downloads')
  const windows = downloads.getByRole('link', { name: /Download Windows/i })

  const [contentLeft, navLeft, architectureRight, downloadsWidth] = await Promise.all([
    heroContent.evaluate((element) => element.getBoundingClientRect().left),
    navLogo.evaluate((element) => element.getBoundingClientRect().left),
    architecture.evaluate((element) => element.getBoundingClientRect().right),
    downloads.evaluate((element) => element.getBoundingClientRect().width)
  ])

  expect(Math.abs(contentLeft - navLeft)).toBeLessThanOrEqual(16)
  expect(architectureRight).toBeCloseTo(1564, 0)
  expect(downloadsWidth).toBeGreaterThanOrEqual(860)
  expect(downloadsWidth).toBeLessThanOrEqual(880)
  await expect(windows).toHaveCSS('min-height', '86px')

  if (testInfo.project.name !== 'Mobile Chrome') {
    await windows.hover()
    await expect(windows).toHaveCSS('background-color', 'rgb(244, 244, 241)')
    await expect(windows).not.toHaveCSS('box-shadow', 'none')
  }
})

test('stacks mobile downloads and keeps the provider strip close to the hero content', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })

  const downloads = page.getByTestId('home-platform-downloads')
  const cards = [
    downloads.getByRole('link', { name: /Download Windows/i }),
    downloads.getByRole('button', { name: /Download macOS/i }),
    downloads.getByRole('link', { name: /Download Linux/i })
  ]
  const rects = await Promise.all(
    cards.map((card) => card.evaluate((element) => element.getBoundingClientRect().toJSON()))
  )

  expect(rects[0]?.width).toBeGreaterThanOrEqual(350)
  expect(rects[1]?.x).toBeCloseTo(rects[0]?.x ?? 0, 0)
  expect(rects[2]?.x).toBeCloseTo(rects[0]?.x ?? 0, 0)
  expect(rects[1]?.y).toBeGreaterThan((rects[0]?.y ?? 0) + (rects[0]?.height ?? 0))
  expect(rects[2]?.y).toBeGreaterThan((rects[1]?.y ?? 0) + (rects[1]?.height ?? 0))

  const githubBottom = await page
    .getByTestId('home-github-link')
    .evaluate((element) => element.getBoundingClientRect().bottom)
  const stats = page.getByTestId('home-hero-stats')
  const statsTop = await stats.evaluate((element) => element.getBoundingClientRect().top)
  const statsBottom = await stats.evaluate((element) => element.getBoundingClientRect().bottom)
  const marqueeTop = await page
    .getByTestId('home-model-marquee')
    .evaluate((element) => element.getBoundingClientRect().top)
  expect(statsTop - githubBottom).toBeCloseTo(48, 0)
  expect(marqueeTop - statsBottom).toBeCloseTo(64, 0)
})

test('keeps the mobile hero subline fully visible without horizontal overflow', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })

  const title = page.getByTestId('home-hero-title')
  await expect(title).toHaveText('Science, Open to All')

  const metrics = await title.evaluate((element) => ({
    right: element.getBoundingClientRect().right,
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    textScrollWidth: element.scrollWidth,
    textClientWidth: element.clientWidth
  }))

  expect(metrics.right).toBeLessThanOrEqual(metrics.viewportWidth)
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth)
  expect(metrics.textScrollWidth).toBeLessThanOrEqual(metrics.textClientWidth)
})

test('matches the prototype section hierarchy and interactive states', async ({
  page
}, testInfo) => {
  await expect(page.getByTestId('spotlight-title')).toHaveCSS('font-weight', '800')
  await page.locator('#ecosystem').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('ecosystem-title')).toHaveCSS('font-weight', '800')
  await page.locator('#open-science').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('workbench-title')).toHaveCSS('font-weight', '800')
  await page.locator('#skills').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('skills-count')).toHaveCSS('font-weight', '800')
  await page.locator('#audit').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('audit-title')).toHaveCSS('font-weight', '800')
  await page.locator('#close').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('closing-title')).toHaveCSS('text-align', 'center')

  const ecosystemNode = page.getByTestId('ecosystem-node-os')
  await expect(ecosystemNode).toHaveCSS('border-radius', '16px')
  await expect(ecosystemNode).toHaveCSS('box-shadow', /inset/)
  await expect(page.getByTestId('ecosystem-detail')).toHaveCSS(
    'background-color',
    'rgb(17, 17, 17)'
  )

  const activeStep = page.getByTestId('workbench-step-docs')
  await expect(activeStep).toHaveCSS('background-color', 'rgb(236, 212, 76)')
  await expect(activeStep).toHaveCSS('color', 'rgb(17, 17, 17)')
  await expect(page.getByRole('tab', { name: 'Documents' })).toHaveCSS(
    'border-bottom-color',
    'rgb(236, 212, 76)'
  )

  const skillCard = page.getByTestId('skill-area-0')
  if (testInfo.project.name === 'Mobile Chrome') {
    await expect(skillCard).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(skillCard.getByTestId('skill-area-description')).toHaveCSS('opacity', '0')
  } else {
    await skillCard.hover()
    await expect(skillCard).toHaveCSS('background-color', 'rgb(17, 17, 17)')
    await expect(skillCard.getByTestId('skill-area-description')).toHaveCSS('opacity', '1')
  }

  await expect(page.getByTestId('audit-disposition-ready')).toHaveCSS(
    'background-color',
    'rgb(230, 244, 237)'
  )
  await expect(page.getByTestId('audit-disposition-reject')).toHaveCSS(
    'background-color',
    'rgb(254, 226, 226)'
  )
})
