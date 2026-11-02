// Fails if a Workers-style bundle of the built package needs a Node built-in.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { nodeBuiltinsInBundle } from './lib/workers-bundle.mjs'

const entry = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.js')
const builtins = await nodeBuiltinsInBundle(entry)
if (builtins.length) {
  console.error(`The Workers bundle needs Node built-ins: ${builtins.join(', ')}`)
  process.exit(1)
}
console.log('The Workers bundle builds with no Node built-ins.')
