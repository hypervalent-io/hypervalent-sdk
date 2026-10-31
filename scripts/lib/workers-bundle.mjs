import { isBuiltin } from 'node:module'

import { build } from 'esbuild'

/**
 * Bundles an entry the way a Workers build does (worker conditions, no Node
 * platform) and answers every Node built-in the bundle would need. A bare
 * `fs` counts as well as `node:fs`.
 */
export async function nodeBuiltinsInBundle(entry) {
  const builtins = new Set()
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    conditions: ['worker', 'browser'],
    logLevel: 'silent',
    plugins: [{
      name: 'record-node-builtins',
      setup(pluginBuild) {
        pluginBuild.onResolve({ filter: /.*/ }, (args) => {
          if (!isBuiltin(args.path)) return null
          builtins.add(args.path)
          return { path: args.path, external: true }
        })
      }
    }]
  })
  return [...builtins].sort()
}
