// Fails if a Workers-style bundle of the built package needs a Node built-in.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { nodeBuiltinsInBundle } from './lib/workers-bundle.mjs'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
for (const file of ['index.js', 'webhooks.js']) {
  const builtins = await nodeBuiltinsInBundle(join(dist, file))
  if (builtins.length) {
    console.error(`The Workers bundle of ${file} needs Node built-ins: ${builtins.join(', ')}`)
    process.exit(1)
  }
  console.log(`The Workers bundle of ${file} builds with no Node built-ins.`)
}
