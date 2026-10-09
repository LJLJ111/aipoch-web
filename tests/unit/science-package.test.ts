import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { Sha256 } from '../../lib/science-package/sha256'

for (const size of [0, 3, 55, 56, 64, 65, 1000000]) {
  test(`streaming SHA-256 matches standard digest at ${size} bytes`, () => {
    const bytes = new Uint8Array(size).map((_, index) => index % 251)
    const hash = new Sha256()
    for (let offset = 0; offset < size; offset += 137)
      hash.update(bytes.subarray(offset, offset + 137))
    expect(hash.hex()).toBe(createHash('sha256').update(bytes).digest('hex'))
  })
}

import { afterEach, mock } from 'bun:test'
import { downloadPackage, readArchive } from '../../lib/science-package/archive'
import { parsePackage } from '../../lib/science-package/parse'
import { buildSciencePackage, digest, packScience } from '../../mocks/fixtures/science-package'

const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})

test('parses one complete session without shortening payloads or generating alternate views', async () => {
  const sample = buildSciencePackage('Test science')
  const result = await parsePackage(new Blob([sample.bytes as BlobPart]), 'test-science')
  expect(result.session.title).toBe('Test science')
  expect(Object.keys(result).sort()).toEqual(['resources', 'session'])
  const group = result.session.items.find((item) => item.type === 'activity-group')
  expect(group?.type === 'activity-group' && group.activities[0].output).toBe(
    'sample '.repeat(5000)
  )
  expect(result.session.omissions).toEqual([])
})

for (const measurable of [true, false]) {
  test(`download reports ${measurable ? 'measured' : 'indeterminate'} progress and verifies bytes`, async () => {
    const sample = buildSciencePackage('Download')
    globalThis.fetch = mock(
      async () =>
        new Response(sample.bytes as BodyInit, {
          headers: measurable ? { 'Content-Length': String(sample.sizeBytes) } : {}
        })
    ) as unknown as typeof fetch
    const states: { stage: string; total?: number }[] = []
    const blob = await downloadPackage(
      { ...sample, url: 'https://cdn.test/a.science', filename: 'a.science' },
      (state) => states.push(state)
    )
    expect(blob.size).toBe(sample.sizeBytes)
    expect(states.at(-1)?.stage).toBe('verifying')
    expect(states.findLast((state) => state.stage === 'downloading')?.total).toBe(
      measurable ? sample.sizeBytes : undefined
    )
  })
}

test('rejects outer hash, truncated downloads, HTTP and CORS errors', async () => {
  const sample = buildSciencePackage('Corruption')
  const info = { ...sample, url: 'https://cdn.test/a.science', filename: 'a.science' }
  globalThis.fetch = mock(
    async () => new Response(sample.bytes as BodyInit)
  ) as unknown as typeof fetch
  await expect(downloadPackage({ ...info, sha256: '0'.repeat(64) }, () => {})).rejects.toThrow(
    'SHA-256'
  )
  await expect(
    downloadPackage({ ...info, sizeBytes: info.sizeBytes + 1 }, () => {})
  ).rejects.toThrow('size')
  globalThis.fetch = mock(
    async () => new Response(null, { status: 404 })
  ) as unknown as typeof fetch
  await expect(downloadPackage(info, () => {})).rejects.toThrow('404')
  globalThis.fetch = mock(async () => {
    throw new TypeError('Failed to fetch')
  }) as unknown as typeof fetch
  await expect(downloadPackage(info, () => {})).rejects.toThrow('CORS')
})

test('rejects invalid archives and corrupt internal inventory', async () => {
  await expect(readArchive(new Blob(['not gzip']))).rejects.toThrow()
  const unsafe = packScience({ '../session.json': new Uint8Array([1]) })
  await expect(readArchive(new Blob([unsafe as BlobPart]))).rejects.toThrow(
    'Unsupported archive entry'
  )
  const sample = buildSciencePackage('Internal corruption')
  const entries = await readArchive(new Blob([sample.bytes as BlobPart]))
  const files = Object.fromEntries(
    await Promise.all(
      Array.from(entries, async ([name, file]) => [
        name,
        new Uint8Array(await file.blob.arrayBuffer())
      ])
    )
  )
  files['session.json'][10] ^= 1
  const corrupted = packScience(files)
  await expect(parsePackage(new Blob([corrupted as BlobPart]), 'bad')).rejects.toThrow(
    'inventory verification'
  )
})

test('large assets are available in the default session without another download', async () => {
  const bytes = new Uint8Array(32 * 1024 ** 2).fill(97)
  const path = `objects/${digest(bytes)}`
  const sample = buildSciencePackage(
    'Large sample',
    {
      messages: [
        {
          id: 'a',
          role: 'assistant',
          content: '[file](large.txt)',
          createdAt: 1,
          artifactIds: ['file']
        }
      ],
      artifacts: [{ id: 'file', name: 'large.txt', path: '$DATA/large.txt', size: bytes.length }]
    },
    { [path]: { bytes, storageKey: 'large.txt' } }
  )
  const result = await parsePackage(new Blob([sample.bytes as BlobPart]), 'large')
  expect(result.resources[0].blob.size).toBe(bytes.length)
  const message = result.session.items[0]
  expect(message.type === 'message' && message.artifacts?.[0].url).toBe('science-asset:0')
  expect(Object.keys(result.session.assets)).toHaveLength(1)
  expect(result.session.items[0].type === 'message' && result.session.items[0].content).toContain(
    'science-asset:0'
  )
})
