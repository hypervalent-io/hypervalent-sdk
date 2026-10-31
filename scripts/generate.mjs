// Generates the wire types from the vendored openapi.json.
//   node scripts/generate.mjs           write src/generated/
//   node scripts/generate.mjs --check   fail if src/generated/ differs from a fresh generation
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderWireTypes, staleFiles, writeRendered } from './lib/wire-types.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const rendered = await renderWireTypes(join(root, 'openapi.json'))

if (process.argv.includes('--check')) {
  const stale = await staleFiles(rendered, root)
  if (stale.length) {
    console.error(`Generated files differ from openapi.json: ${stale.join(', ')}`)
    console.error('They are never edited by hand. Run `npm run generate` and commit the result.')
    process.exit(1)
  }
  console.log('Generated files match openapi.json.')
}
else {
  await writeRendered(rendered, root)
  for (const path of Object.keys(rendered)) console.log(`Wrote ${path}`)
}
