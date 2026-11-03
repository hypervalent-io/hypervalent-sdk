import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { operationIds } from './spec.mjs'

import openapiTS, { astToString } from 'openapi-typescript'

const BANNER = `// GENERATED from openapi.json by scripts/generate.mjs. Do not edit by hand:
// run \`npm run generate\`. \`npm run check\` fails when this file differs.
`

/** Generated file contents for a spec, keyed by path relative to the package root. */
export async function renderWireTypes(specPath) {
  const spec = JSON.parse(await readFile(specPath, 'utf8'))
  // openapi-typescript's defaultNonNullable (on by default) makes every property with a `default`
  // required. In this spec only write bodies declare property defaults (parameter defaults do not
  // change a parameter's optionality), and a default there is what the API fills in when the field
  // is omitted, so it must stay optional (CMS-772).
  const ast = await openapiTS(pathToFileURL(specPath), { defaultNonNullable: false })
  const ids = operationIds(spec).map(id => `  ${JSON.stringify(id)}`).join(',\n')
  return {
    'src/generated/openapi.ts': `${BANNER}\n${astToString(ast)}`,
    'src/generated/spec.ts': `${BANNER}
/** The \`info.version\` of the OpenAPI document these types were generated from. */
export const SPEC_VERSION = ${JSON.stringify(spec.info.version)}

/** Every \`operationId\` in that document. */
export const OPERATION_IDS = [
${ids}
] as const
`
  }
}

/** Writes rendered output under rootDir, creating directories as needed. */
export async function writeRendered(rendered, rootDir) {
  for (const [path, content] of Object.entries(rendered)) {
    await mkdir(dirname(join(rootDir, path)), { recursive: true })
    await writeFile(join(rootDir, path), content)
  }
}

/** Paths under rootDir whose content differs from the rendered output, or that are missing. */
export async function staleFiles(rendered, rootDir) {
  const stale = []
  for (const [path, expected] of Object.entries(rendered)) {
    const actual = await readFile(join(rootDir, path), 'utf8').catch(() => null)
    if (actual !== expected) stale.push(path)
  }
  return stale
}
