import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { operationIds } from '../scripts/lib/spec.mjs'
import { renderWireTypes, staleFiles, writeRendered } from '../scripts/lib/wire-types.mjs'
import { OPERATION_IDS, SPEC_VERSION } from '../src/generated/spec'

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

const SPEC_PATH = join(import.meta.dirname, '..', 'openapi.json')
const OPENAPI_TS = 'src/generated/openapi.ts'

const vendoredSpec = async () => JSON.parse(await readFile(SPEC_PATH, 'utf8'))

describe('generated wire types', () => {
  it('covers every operation in the vendored spec', async () => {
    const spec = await vendoredSpec()
    const ids = operationIds(spec)
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...OPERATION_IDS].sort()).toEqual([...ids].sort())
    expect(SPEC_VERSION).toBe(spec.info.version)
  })
})

describe('check', () => {
  let root: string
  let rendered: Record<string, string>

  beforeAll(async () => {
    rendered = await renderWireTypes(SPEC_PATH)
  })

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'sdk-check-'))
    await writeRendered(rendered, root)
  })

  afterEach(() => rm(root, { recursive: true, force: true }))

  it('passes on untouched output, which is deterministic', async () => {
    expect(await staleFiles(await renderWireTypes(SPEC_PATH), root)).toEqual([])
  })

  it('fails on a hand edit', async () => {
    await writeFile(join(root, OPENAPI_TS), `${rendered[OPENAPI_TS]}// edited\n`)
    expect(await staleFiles(rendered, root)).toEqual([OPENAPI_TS])
  })

  it('fails on a missing file', async () => {
    await rm(join(root, OPENAPI_TS))
    expect(await staleFiles(rendered, root)).toEqual([OPENAPI_TS])
  })

  it('fails when the spec moved on and nothing was regenerated', async () => {
    const spec = await vendoredSpec()
    spec.info.version = '99.0.0'
    const changedSpec = join(root, 'changed.json')
    await writeFile(changedSpec, JSON.stringify(spec))
    expect(await staleFiles(await renderWireTypes(changedSpec), root)).toContain('src/generated/spec.ts')
  })
})
