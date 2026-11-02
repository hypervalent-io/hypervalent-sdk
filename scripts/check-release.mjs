// Fails when the package is not releasable as it stands.
//   node scripts/check-release.mjs          package.json and CHANGELOG.md
//   node scripts/check-release.mjs v1.2.3   and the tag matches the version
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { releaseProblems } from './lib/release.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const changelog = await readFile(join(root, 'CHANGELOG.md'), 'utf8')

const problems = releaseProblems({ pkg, changelog, tag: process.argv[2] })
if (problems.length > 0) {
  for (const problem of problems) console.error(problem)
  process.exit(1)
}
console.log(`${pkg.name}@${pkg.version} is releasable`)
