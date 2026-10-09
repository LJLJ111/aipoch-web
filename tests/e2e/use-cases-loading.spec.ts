import { expect, test } from '@playwright/test'

test('shows honest stage progress, error reasons and a fresh retry', async ({ page }) => {
  // Control worker timing to assert short-lived states without delaying production code.
  await page.addInitScript(() => {
    const workers: { onmessage?: (event: MessageEvent) => void; terminated: boolean }[] = []
    Object.assign(window, { replayTestWorkers: workers })
    class ControlledWorker {
      onmessage?: (event: MessageEvent) => void
      terminated = false
      constructor() {
        workers.push(this)
      }
      postMessage() {}
      terminate() {
        this.terminated = true
      }
    }
    Object.assign(window, { Worker: ControlledWorker })
  })
  let releaseInfo: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    releaseInfo = resolve
  })
  await page.route('**/internal/use-cases/loading-sample', async (route) => {
    await gate
    await route.fulfill({
      json: {
        url: 'https://cdn.test/sample.science',
        filename: 'sample.science',
        sizeBytes: 100,
        sha256: 'a'.repeat(64)
      }
    })
  })
  await page.goto('/open-science/use-cases/loading-sample/replay')
  await expect(page.getByRole('status')).toHaveText('Fetching package information…')
  await expect(page.getByRole('progressbar')).not.toHaveAttribute('value')
  releaseInfo()
  await page.waitForFunction(
    () => (window as unknown as { replayTestWorkers: unknown[] }).replayTestWorkers.length === 1
  )
  const emit = (data: unknown) =>
    page.evaluate((data) => {
      const workers = (
        window as unknown as {
          replayTestWorkers: { onmessage: (event: { data: unknown }) => void }[]
        }
      ).replayTestWorkers
      workers.at(-1)?.onmessage({ data })
    }, data)
  await emit({ type: 'progress', progress: { stage: 'downloading', loaded: 20, total: 100 } })
  await expect(page.getByRole('status')).toHaveText('Downloading research package…')
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '20')
  await expect(page.getByText('20%', { exact: true })).toBeVisible()
  await emit({ type: 'progress', progress: { stage: 'downloading', loaded: 30 } })
  await expect(page.getByRole('progressbar')).not.toHaveAttribute('value')
  for (const [stage, label] of [
    ['verifying', 'Verifying SHA-256…'],
    ['parsing', 'Parsing research session…']
  ]) {
    await emit({ type: 'progress', progress: { stage } })
    await expect(page.getByRole('status')).toHaveText(label)
    await expect(page.getByRole('progressbar')).not.toHaveAttribute('value')
  }
  await emit({ type: 'error', message: 'Package SHA-256 verification failed.' })
  await expect(page.locator('main').getByRole('alert')).toContainText(
    'Package SHA-256 verification failed.'
  )
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await page.waitForFunction(
    () => (window as unknown as { replayTestWorkers: unknown[] }).replayTestWorkers.length === 2
  )
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { replayTestWorkers: { terminated: boolean }[] }).replayTestWorkers[0]
          .terminated
    )
  ).toBe(true)
})
