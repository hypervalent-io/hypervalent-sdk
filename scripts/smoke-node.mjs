// Loads the built package by name, through its `exports` map, as both ESM and CJS.
import { createRequire } from 'node:module'

const esm = await import('@hypervalent-io/sdk')
const cjs = createRequire(import.meta.url)('@hypervalent-io/sdk')

for (const [format, sdk] of [['ESM', esm], ['CJS', cjs]]) {
  if (typeof sdk.SPEC_VERSION !== 'string') {
    console.error(`${format} build did not export SPEC_VERSION`)
    process.exit(1)
  }
  console.log(`${format} import OK on Node ${process.version} (spec ${sdk.SPEC_VERSION})`)
}
