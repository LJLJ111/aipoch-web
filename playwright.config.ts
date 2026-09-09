import { defineConfig, devices } from '@playwright/test'

const GOOGLE_ANALYTICS_TEST_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-TEST'
const CLARITY_TEST_ID = process.env.NEXT_PUBLIC_CLARITY_ID || 'CLARITYTEST'
const NEXT_TEST_DIST_DIR = process.env.NEXT_DIST_DIR || '.next/e2e'
const PLAYWRIGHT_HOST = process.env.PLAYWRIGHT_HOST || '127.0.0.1'
const PLAYWRIGHT_PORT = process.env.PLAYWRIGHT_PORT || '3212'
const PLAYWRIGHT_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL || `http://${PLAYWRIGHT_HOST}:${PLAYWRIGHT_PORT}`
const OPEN_SCIENCE_E2E_MANIFEST = JSON.stringify({
  version: '1.0.0',
  releaseDate: '2026-09-07T01:13:01Z',
  downloads: {
    'win-x64': { url: 'https://cdn.example.com/open-science.exe' },
    'mac-arm64': { url: 'https://cdn.example.com/open-science-arm.dmg' },
    'mac-x64': { url: 'https://cdn.example.com/open-science-intel.dmg' },
    'linux-x64-deb': { url: 'https://cdn.example.com/open-science.deb' }
  }
})

process.env.NEXT_PUBLIC_GA_ID = GOOGLE_ANALYTICS_TEST_ID
process.env.NEXT_PUBLIC_CLARITY_ID = CLARITY_TEST_ID

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.(ts|tsx)$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
    trace: 'on-first-retry'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],

  webServer: {
    command: `bun --bun next dev --hostname ${PLAYWRIGHT_HOST} --port ${PLAYWRIGHT_PORT}`,
    env: {
      NEXT_DIST_DIR: NEXT_TEST_DIST_DIR,
      NEXT_PUBLIC_GA_ID: GOOGLE_ANALYTICS_TEST_ID,
      NEXT_PUBLIC_CLARITY_ID: CLARITY_TEST_ID,
      // RSC fetch bypasses Playwright page.route; serve homepage fixtures in-process.
      E2E_HOMEPAGE_MOCK: '1',
      E2E_OPEN_SCIENCE_MANIFEST: OPEN_SCIENCE_E2E_MANIFEST
    },
    url: PLAYWRIGHT_BASE_URL,
    // Always start fresh so E2E_HOMEPAGE_MOCK is present on the Next process.
    // Reusing a local server without that env would hit the live homepage API.
    reuseExistingServer: false,
    timeout: 60000
  }
})
