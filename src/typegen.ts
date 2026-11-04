import type { ClientResources } from './resources'
import type { AtomSchema, ContainerSchema, ProjectSchema } from './schema'

import { HypervalentError } from './errors'
import { MEDIA_TYPES } from './schema'

/** The fields of a catalog atom the mapping reads. */
interface AtomInput {
  uuid: string
  slug: string
  fieldType: string
  multiple: boolean | number
  fieldConfig?: { options?: unknown } | null
}

interface ContainerInput {
  uuid: string
  slug: string
  atoms: { uuid: string }[]
  supports: string[]
}

export interface Catalog {
  project: { uuid: string, slug: string }
  status: 'published' | 'draft'
  atoms: AtomInput[]
  molecules: ContainerInput[]
  doctypes: ContainerInput[]
  taxonomies: ContainerInput[]
}

const scalar = (type: string) => () => type

function selectType(atom: AtomInput) {
  const options = atom.fieldConfig?.options
  const values = (Array.isArray(options) ? options : [])
    .map((option: unknown) => (typeof option === 'object' && option !== null ? (option as { value?: unknown }).value : option))
    // The API compares a value with the options strictly, so a numeric option is a number here too.
    .filter(value => typeof value === 'string' || typeof value === 'number')
  return values.length > 0 ? [...new Set(values)].map(value => JSON.stringify(value)).join(' | ') : 'string'
}

/**
 * Field type to its value's TS type, mirroring `checkAtomValue` in the API's
 * `public-structure-write-service.js`. Guarded twice: `test/typegen.test.ts`
 * against the vendored spec's enum, and the root repo's `e2e/sdk-typegen.spec.ts`
 * against `backend/src/atoms/field-types.js` itself.
 */
export const FIELD_TYPE_MAPPINGS: Record<string, (atom: AtomInput) => string> = {
  text: scalar('string'),
  textarea: scalar('string'),
  html: scalar('string'),
  markdown: scalar('string'),
  number: scalar('number'),
  color: scalar('string'),
  image: scalar('string'),
  select: selectType,
  range: scalar('number'),
  spacing: scalar('SpacingValue'),
  date: scalar('string'),
  boolean: scalar('boolean'),
  icon: scalar('string'),
  link: scalar('string'),
  video: scalar('string'),
  file: scalar('string'),
  email: scalar('string'),
  tel: scalar('string'),
  slug: scalar('string')
}

/** The TS type of one atom's value, or null for a field type this SDK release has not heard of. */
export function fieldTsType(atom: AtomInput): string | null {
  const mapping = Object.hasOwn(FIELD_TYPE_MAPPINGS, atom.fieldType) ? FIELD_TYPE_MAPPINGS[atom.fieldType] : undefined
  if (!mapping) return null
  const type = mapping(atom)
  if (MEDIA_TYPES.has(atom.fieldType) || Number(atom.multiple) === 1) return type.includes(' | ') ? `(${type})[]` : `${type}[]`
  return type
}

const bySlug = <V extends { slug: string }>(rows: V[]) => [...rows].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))

export interface GeneratedSchema {
  schema: ProjectSchema
  /** The TypeScript file. */
  source: string
  /** What the output leaves out or leaves loose, for the CLI to print. */
  warnings: string[]
}

/** Pure, and sorted by slug, so the same content model always gives the same bytes. */
export function renderSchema(catalog: Catalog): GeneratedSchema {
  const warnings: string[] = []
  const atomByUuid = new Map(catalog.atoms.map(atom => [atom.uuid, atom]))
  const moleculeByUuid = new Map(catalog.molecules.map(molecule => [molecule.uuid, molecule]))
  let usesSpacing = false

  const containers = (kind: string, rows: ContainerInput[]) => {
    const values: Record<string, ContainerSchema> = {}
    const types: string[] = []
    for (const row of bySlug(rows)) {
      const atoms: Record<string, AtomSchema> = {}
      const fields: string[] = []
      const bound = row.atoms.flatMap((binding) => {
        const atom = atomByUuid.get(binding.uuid)
        if (!atom) warnings.push(`${kind} '${row.slug}' binds atom ${binding.uuid}, which this read does not list. It was left out.`)
        return atom ? [atom] : []
      })
      for (const atom of bySlug(bound)) {
        atoms[atom.slug] = { uuid: atom.uuid, fieldType: atom.fieldType, multiple: Number(atom.multiple) === 1 }
        if (atom.fieldType === 'spacing') usesSpacing = true
        let type = fieldTsType(atom)
        if (type === null) {
          warnings.push(`Atom '${atom.slug}' has field type '${atom.fieldType}', which this SDK does not know. It is typed unknown.`)
          type = 'unknown'
        }
        fields.push(`        ${JSON.stringify(atom.slug)}: ${type}`)
      }
      const supports = row.supports.flatMap((uuid) => {
        const molecule = moleculeByUuid.get(uuid)
        if (!molecule) warnings.push(`${kind} '${row.slug}' supports molecule ${uuid}, which this read does not list. It was left out.`)
        return molecule ? [molecule.slug] : []
      }).sort()
      values[row.slug] = { uuid: row.uuid, atoms, supports }
      const blocks = supports.map(slug => JSON.stringify(slug)).join(' | ') || 'never'
      types.push(`    ${JSON.stringify(row.slug)}: {\n      atoms: {${fields.length ? `\n${fields.join('\n')}\n      ` : ''}}\n      blocks: ${blocks}\n    }`)
    }
    return { values, type: types.length ? `{\n${types.join('\n')}\n  }` : '{}' }
  }

  const doctypes = containers('Document type', catalog.doctypes)
  const taxonomies = containers('Taxonomy', catalog.taxonomies)
  const molecules = containers('Molecule', catalog.molecules)
  const schema: ProjectSchema = {
    version: 1,
    project: catalog.project,
    status: catalog.status,
    doctypes: doctypes.values,
    taxonomies: taxonomies.values,
    molecules: molecules.values
  }

  const source = `// Generated by \`npx @hypervalent-io/sdk typegen\`. Do not edit: run it again.
// A snapshot of one project's ${catalog.status} content model. An edit in Studio can make it
// stale, and runtime values are not validated against these types.
import { defineSchema${usesSpacing ? ', type SpacingValue' : ''} } from '@hypervalent-io/sdk'

export type HypervalentFields = {
  doctypes: ${doctypes.type}
  taxonomies: ${taxonomies.type}
  molecules: ${molecules.type}
}

export const schema = defineSchema<HypervalentFields>(${JSON.stringify(schema, null, 2)})
`
  return { schema, source, warnings }
}

/** Reads what `renderSchema` needs through the client. `project` may be omitted on a narrowed token. */
export async function readCatalog(hv: ClientResources, options: { project?: string, status?: 'published' | 'draft' } = {}): Promise<Catalog> {
  const status = options.status ?? 'published'
  const { token, features } = await hv.whoami()
  // The API refuses `?status=draft` from such a token with a 403 (spec 1.7.0 on; before it, the published
  // view came back instead). Checked here, after the one whoami read, so the CLI reads no structure and names its own flag.
  if (status === 'draft' && (token.scope !== 'read_write' || !features.apiTokensWrite)) {
    throw new HypervalentError({ status: 0, code: 'TOKEN_SCOPE_READ_ONLY', message: '--status draft needs a read_write token on a plan with API writes. The API refuses any other token with a 403.' })
  }
  const slug = options.project ?? token.projectSlug
  if (!slug) {
    throw new HypervalentError({ status: 0, code: 'PROJECT_REQUIRED', message: 'This token is not narrowed to a live project. Name one with --project.' })
  }
  let project: { uuid: string, slug: string } | undefined
  for await (const row of hv.projects.iterate()) {
    if (row.slug === slug) {
      project = { uuid: row.uuid, slug: row.slug }
      break
    }
  }
  if (!project) throw new HypervalentError({ status: 404, code: 'NOT_FOUND', message: `This token cannot see a project '${slug}'.` })

  const site = hv.project(project.slug)
  const query = status === 'draft' ? { status: 'draft' as const } : {}
  const [atoms, molecules, doctypes, taxonomies] = await Promise.all([
    site.atoms.list(query),
    site.molecules.list(query),
    site.doctypes.list(query),
    site.taxonomies.list(query)
  ])
  return {
    project,
    status,
    atoms: atoms.results as AtomInput[],
    molecules: molecules.results,
    doctypes: doctypes.results,
    taxonomies: taxonomies.results
  }
}
