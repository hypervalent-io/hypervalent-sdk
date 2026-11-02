import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parseArgs } from 'node:util'

import { createClient } from '../client'
import { isHypervalentError } from '../errors'
import { readCatalog, renderSchema } from '../typegen'

const USAGE = `Usage: hypervalent-sdk typegen --project <slug> --out <file> [options]

Writes a typed schema for createClient({ schema }). The token comes from the
HYPERVALENT_TOKEN environment variable, so it stays out of your shell history.

  --project <slug>    The project. May be omitted on a project-narrowed token.
  --out <file>        The TypeScript file to write.
  --status <status>   published (default), or draft for the working structure,
                      which needs a read_write token.
  --org <slug>        The org id. Read from the token when omitted.
  --base-url <url>    Defaults to https://api.hypervalent.io.
`

export interface CliIo {
  env: Record<string, string | undefined>
  stdout: (text: string) => void
  stderr: (text: string) => void
  fetch?: typeof fetch
}

/** Answers the exit code. */
export async function run(argv: string[], io: CliIo): Promise<number> {
  const fail = (message: string) => {
    io.stderr(`${message}\n`)
    return 1
  }
  let parsed
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        'project': { type: 'string' },
        'out': { type: 'string' },
        'status': { type: 'string' },
        'org': { type: 'string' },
        'base-url': { type: 'string' },
        'help': { type: 'boolean', short: 'h' }
      }
    })
  }
  catch (error) {
    return fail(`${(error as Error).message}\n\n${USAGE}`)
  }
  const { values, positionals } = parsed
  if (values.help) {
    io.stdout(USAGE)
    return 0
  }
  if (positionals.length !== 1 || positionals[0] !== 'typegen') return fail(USAGE)
  if (!values.out) return fail(`--out is required.\n\n${USAGE}`)
  const status = values.status ?? 'published'
  if (status !== 'published' && status !== 'draft') return fail('--status must be published or draft.')
  const token = io.env.HYPERVALENT_TOKEN
  if (!token) return fail('Set HYPERVALENT_TOKEN to an API token.')

  try {
    const hv = createClient({
      token,
      ...(values.org ? { org: values.org } : {}),
      ...(values['base-url'] ? { baseUrl: values['base-url'] } : {}),
      ...(io.fetch ? { fetch: io.fetch } : {})
    })
    const catalog = await readCatalog(hv, { status, ...(values.project ? { project: values.project } : {}) })
    const { source, warnings } = renderSchema(catalog)
    await mkdir(dirname(values.out), { recursive: true })
    await writeFile(values.out, source)
    for (const warning of warnings) io.stderr(`warning: ${warning}\n`)
    io.stdout(`Wrote ${values.out}: ${catalog.doctypes.length} document types, ${catalog.taxonomies.length} taxonomies, ${catalog.molecules.length} molecules, ${catalog.atoms.length} atoms (${status}) from project ${catalog.project.slug}.\n`)
    return 0
  }
  catch (error) {
    if (isHypervalentError(error)) return fail(`${error.code}: ${error.message}`)
    return fail(error instanceof Error ? error.message : String(error))
  }
}
