// Compares the vendored openapi.json with the published spec.
//   node scripts/spec-drift.mjs           exit 1 on a difference, 2 if it cannot be fetched
//   node scripts/spec-drift.mjs --write   replace the vendored copy with the published one
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describeDrift } from './lib/spec.mjs'

const SPEC_URL = process.env.HYPERVALENT_SPEC_URL ?? 'https://docs.hypervalent.io/openapi.json'
const specPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'openapi.json')

let body
let live
try {
  const response = await fetch(SPEC_URL, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  body = await response.text()
  live = JSON.parse(body)
  // Valid JSON is not enough: --write would replace the vendored spec with it.
  if (typeof live?.info?.version !== 'string' || typeof live.paths !== 'object' || live.paths === null) {
    throw new Error('not an OpenAPI document')
  }
}
catch (err) {
  console.error(`Could not read ${SPEC_URL}: ${err.message}`)
  process.exit(2)
}

if (process.argv.includes('--write')) {
  await writeFile(specPath, body)
  console.log(`Updated openapi.json from ${SPEC_URL}.`)
  process.exit(0)
}

const drift = describeDrift(JSON.parse(await readFile(specPath, 'utf8')), live)
if (drift) {
  console.error(`openapi.json differs from ${SPEC_URL}.`)
  console.error(`  version: vendored ${drift.vendoredVersion}, published ${drift.liveVersion}`)
  console.error(`  operations added: ${drift.addedOperations.join(', ') || 'none'}`)
  console.error(`  operations removed: ${drift.removedOperations.join(', ') || 'none'}`)
  console.error('Run `npm run spec:sync`, review the type changes, and commit.')
  process.exit(1)
}
console.log(`openapi.json matches ${SPEC_URL}.`)
