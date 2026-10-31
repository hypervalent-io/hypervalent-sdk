import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { nodeBuiltinsInBundle } from '../scripts/lib/workers-bundle.mjs'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('package.json', () => {
  it('has no runtime dependencies', async () => {
    const pkg = JSON.parse(await readFile(join(import.meta.dirname, '..', 'package.json'), 'utf8'))
    expect(pkg.dependencies ?? {}).toEqual({})
    expect(pkg.peerDependencies ?? {}).toEqual({})
    expect(pkg.optionalDependencies ?? {}).toEqual({})
  })
})

describe('Workers bundle guard', () => {
  let dir: string

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'sdk-workers-'))
  })

  afterAll(() => rm(dir, { recursive: true, force: true }))

  const bundle = async (source: string) => {
    const entry = join(dir, 'entry.js')
    await writeFile(entry, source)
    return nodeBuiltinsInBundle(entry)
  }

  it('passes the package source', async () => {
    expect(await nodeBuiltinsInBundle(join(import.meta.dirname, '..', 'src', 'index.ts'))).toEqual([])
  })

  it('catches prefixed and bare built-ins', async () => {
    expect(await bundle(`import 'node:fs'\nimport 'path'\n`)).toEqual(['node:fs', 'path'])
  })

  it('ignores web platform code', async () => {
    expect(await bundle(`export const hash = crypto.subtle.digest\n`)).toEqual([])
  })
})
