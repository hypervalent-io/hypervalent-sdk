import type { components } from './generated/openapi'
import type { Answer, CallOptions, ReadOptions, WalkOptions } from './resources'

import { HypervalentError } from './errors'
import { assertWriteAllowed } from './transport'

type Schemas = components['schemas']

/** The value of a spacing field, in pixels. */
export interface SpacingValue {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

/**
 * A color field's design-token reference (API spec 1.12.0): `token` is a colour role's slug.
 * A content read lists each referenced role once in `referencedTokens`, with the CSS variable
 * the public stylesheet sets (`cssVar`) and the default scheme's value.
 */
export interface ColorTokenRef {
  token: string
}

/**
 * A token field's value (API spec 1.13.0): `token` is the slug of a design token of the type the
 * field's `fieldConfig.tokenType` names (`radius`, `elevation` or `typography`). A content read
 * lists each referenced token once in `referencedTokens`, with its CSS variable and value.
 */
export interface TokenRef {
  token: string
}

export interface AtomSchema {
  uuid: string
  fieldType: string
  multiple: boolean
}

/** A document type, taxonomy or molecule. `supports` holds molecule slugs. */
export interface ContainerSchema {
  uuid: string
  atoms: Record<string, AtomSchema>
  supports: readonly string[]
}

interface ContainerTypes {
  atoms: Record<string, unknown>
  blocks: string
}

/** The compile-time half of a schema: value types by container and field slug. */
export interface SchemaTypes {
  doctypes: Record<string, ContainerTypes>
  taxonomies: Record<string, ContainerTypes>
  molecules: Record<string, ContainerTypes>
}

/** What `typegen` emits. Its uuids pin it to one project. */
export interface ProjectSchema<T extends SchemaTypes = SchemaTypes> {
  version: 1
  project: { uuid: string, slug: string }
  status: 'published' | 'draft'
  doctypes: Record<string, ContainerSchema>
  taxonomies: Record<string, ContainerSchema>
  molecules: Record<string, ContainerSchema>
  /** Never set. Carries `T` to `createClient`. */
  readonly __types?: T
}

/** Attaches the generated types to the generated value. Generated code calls this. */
export function defineSchema<T extends SchemaTypes>(schema: Omit<ProjectSchema<T>, '__types'>): ProjectSchema<T> {
  return schema
}

export function isProjectSchema(value: unknown): value is ProjectSchema {
  const schema = value as Partial<ProjectSchema> | null | undefined
  return schema?.version === 1 && typeof schema.project?.uuid === 'string' && !!schema.doctypes && !!schema.taxonomies && !!schema.molecules
}

/** A field as a read answers it. Any field may hold no value. */
export type ReadFields<Atoms> = { [K in keyof Atoms]: Atoms[K] | null }
/** A field as a write takes it. Null clears it. */
export type WriteFields<Atoms> = { [K in keyof Atoms]?: Atoms[K] | null }

/** A molecule instance to write. `key` is minted by the API when omitted. */
export type WriteBlock<T extends SchemaTypes, Slug> = Slug extends keyof T['molecules'] ? {
  molecule: Slug
  atoms?: WriteFields<T['molecules'][Slug]['atoms']>
  children?: WriteBlock<T, T['molecules'][Slug]['blocks']>[]
  key?: string
} : never

/** A node whose molecule the schema does not know: the content model moved on since it was generated. */
export interface UnknownBlock<T extends SchemaTypes> {
  molecule: null
  uuid: string
  key: string
  atoms: Record<string, unknown>
  children: ReadBlock<T, keyof T['molecules']>[]
}

export type ReadBlock<T extends SchemaTypes, Slug> = UnknownBlock<T> | (Slug extends keyof T['molecules'] ? {
  molecule: Slug
  uuid: string
  key: string
  atoms: ReadFields<T['molecules'][Slug]['atoms']>
  children: ReadBlock<T, T['molecules'][Slug]['blocks']>[]
} : never)

/** Added to whatever carries `rootAtoms` and `content`: a version, or a list row. */
export interface TypedContent<T extends SchemaTypes, C extends ContainerTypes> {
  /** By field slug. Every field of the schema is present. */
  rootAtoms: ReadFields<C['atoms']>
  /** Root atoms the schema does not know, as the API sent them. Non-empty means the schema is stale. */
  unmappedRootAtoms: Schemas['ProjectedRootAtom'][]
  /** `content`, with molecule slugs. `content` itself is left as the API sent it. */
  blocks: ReadBlock<T, C['blocks']>[]
}

type Typed<Row, T extends SchemaTypes, C extends ContainerTypes> = Omit<Row, 'rootAtoms'> & TypedContent<T, C>
type TypedRead<Read extends { version: unknown }, T extends SchemaTypes, C extends ContainerTypes> = Omit<Read, 'version'> & { version: Typed<Schemas['Version'], T, C> | null }

type TypedDocumentRead<T extends SchemaTypes, C extends ContainerTypes> = TypedRead<Schemas['DocumentRead'], T, C>
type TypedTermRead<T extends SchemaTypes, C extends ContainerTypes> = TypedRead<Schemas['TermRead'], T, C>
type TypedDocumentRow<T extends SchemaTypes, C extends ContainerTypes> = Typed<Schemas['ListedDocument'], T, C>
type TypedTermRow<T extends SchemaTypes, C extends ContainerTypes> = Typed<Schemas['ListedTerm'], T, C>
type TypedDocumentPage<T extends SchemaTypes, C extends ContainerTypes> = Omit<Answer<'listDocuments'>, 'documents'> & {
  documents: Omit<Answer<'listDocuments'>['documents'], 'results'> & { results: TypedDocumentRow<T, C>[] }
}
type TypedTermPage<T extends SchemaTypes, C extends ContainerTypes> = Omit<Answer<'getTaxonomy'>, 'terms'> & {
  terms: Omit<Answer<'getTaxonomy'>['terms'], 'results'> & { results: TypedTermRow<T, C>[] }
}

type TypedWrite<Write, T extends SchemaTypes, C extends ContainerTypes> = Omit<Write, 'rootAtoms' | 'content'> & {
  /** By field slug. A slug the schema does not bind here is refused before any request. */
  rootAtoms?: WriteFields<C['atoms']>
  /** The content tree, by molecule and field slug. It replaces the whole tree. */
  blocks?: WriteBlock<T, C['blocks']>[]
}

export interface TypedDocumentsResource<T extends SchemaTypes, C extends ContainerTypes> {
  list(options?: ReadOptions<'listDocuments'>): Promise<TypedDocumentPage<T, C>>
  pages(options?: WalkOptions<'listDocuments'>): AsyncGenerator<TypedDocumentPage<T, C>, void>
  iterate(options?: WalkOptions<'listDocuments'>): AsyncGenerator<TypedDocumentRow<T, C>, void>
  get(slug: string, options?: ReadOptions<'getDocument'>): Promise<TypedDocumentRead<T, C>>
  create(body: TypedWrite<Schemas['DocumentWrite'], T, C>, options?: CallOptions): Promise<TypedDocumentRead<T, C>>
  update(slug: string, body: TypedWrite<Schemas['DocumentWrite'], T, C>, options?: CallOptions): Promise<TypedDocumentRead<T, C>>
  publish(slug: string, options?: CallOptions): Promise<TypedDocumentRead<T, C>>
  unpublish(slug: string, options?: CallOptions): Promise<TypedDocumentRead<T, C>>
  trash(slug: string, options?: CallOptions): Promise<Answer<'trashDocument'>>
}

export interface TypedTermsResource<T extends SchemaTypes, C extends ContainerTypes> {
  list(options?: ReadOptions<'getTaxonomy'>): Promise<TypedTermPage<T, C>>
  pages(options?: WalkOptions<'getTaxonomy'>): AsyncGenerator<TypedTermPage<T, C>, void>
  iterate(options?: WalkOptions<'getTaxonomy'>): AsyncGenerator<TypedTermRow<T, C>, void>
  get(slug: string, options?: ReadOptions<'getTerm'>): Promise<TypedTermRead<T, C>>
  create(body: TypedWrite<Schemas['TermWrite'], T, C>, options?: CallOptions): Promise<TypedTermRead<T, C>>
  update(slug: string, body: TypedWrite<Schemas['TermWrite'], T, C>, options?: CallOptions): Promise<TypedTermRead<T, C>>
  publish(slug: string, options?: CallOptions): Promise<TypedTermRead<T, C>>
  unpublish(slug: string, options?: CallOptions): Promise<TypedTermRead<T, C>>
  trash(slug: string, options?: CallOptions): Promise<Answer<'trashTerm'>>
}

/** Always an array, `multiple` or not: the API stores them that way. */
export const MEDIA_TYPES = new Set(['image', 'file', 'video'])

function refuse(message: string, fields: Record<string, string>): never {
  throw new HypervalentError({ status: 0, code: 'SCHEMA_VALIDATION', message, fields })
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const known = (names: Iterable<string>) => [...names].join(', ') || 'none'

const entry = <V>(record: Record<string, V>, key: string): V | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined

/** Field slug to atom uuid, for one container's write. Every failure is collected, so one retry can fix them all. */
function mapRootAtoms(container: ContainerSchema, rootAtoms: unknown, errors: Record<string, string>) {
  if (!isPlainObject(rootAtoms)) {
    errors.rootAtoms = 'Must be an object keyed by field slug'
    return undefined
  }
  const mapped: Record<string, unknown> = {}
  for (const [slug, value] of Object.entries(rootAtoms)) {
    const atom = entry(container.atoms, slug)
    if (atom) mapped[atom.uuid] = value
    else errors[`rootAtoms.${slug}`] = `Not a field here. Allowed: ${known(Object.keys(container.atoms))}`
  }
  return mapped
}

/** Blocks by slug to the API's content nodes, whose `atoms` stay keyed by atom slug. */
function mapBlocks(schema: ProjectSchema, supports: readonly string[], blocks: unknown, path: string, errors: Record<string, string>): unknown[] {
  if (!Array.isArray(blocks)) {
    errors[path] = 'Must be an array of blocks'
    return []
  }
  return blocks.map((block: unknown, index) => {
    const at = `${path}[${index}]`
    if (!isPlainObject(block)) {
      errors[at] = 'Must be an object { molecule, atoms?, children?, key? }'
      return null
    }
    const slug = String(block.molecule)
    const molecule = supports.includes(slug) ? entry(schema.molecules, slug) : undefined
    if (!molecule) {
      errors[`${at}.molecule`] = `'${slug}' is not allowed here. Allowed: ${known(supports)}`
      return null
    }
    const atoms = block.atoms ?? {}
    if (!isPlainObject(atoms)) errors[`${at}.atoms`] = 'Must be an object keyed by field slug'
    else {
      for (const name of Object.keys(atoms)) {
        if (!entry(molecule.atoms, name)) errors[`${at}.atoms.${name}`] = `Not a field of '${slug}'. Allowed: ${known(Object.keys(molecule.atoms))}`
      }
    }
    const node: Record<string, unknown> = {
      uuid: molecule.uuid,
      atoms,
      children: mapBlocks(schema, molecule.supports, block.children ?? [], `${at}.children`, errors)
    }
    if (block.key !== undefined) node.key = block.key
    return node
  })
}

/** A typed write body to the API's. Throws `SCHEMA_VALIDATION` before any request. */
export function mapWriteBody(schema: ProjectSchema, container: ContainerSchema, body: unknown): Record<string, unknown> {
  if (!isPlainObject(body)) throw new TypeError('A write body must be an object')
  const { rootAtoms, blocks, ...rest } = body
  const errors: Record<string, string> = {}
  const mapped: Record<string, unknown> = { ...rest }
  if (rootAtoms !== undefined) mapped.rootAtoms = mapRootAtoms(container, rootAtoms, errors)
  if (blocks !== undefined) {
    if (rest.content !== undefined) errors.blocks = 'Send blocks or content, not both'
    mapped.content = mapBlocks(schema, container.supports, blocks, 'blocks', errors)
  }
  if (Object.keys(errors).length > 0) refuse('This write does not fit the schema. If the content model changed, run typegen again.', errors)
  return mapped
}

/**
 * `{}` is the API's stored "no default" on every field but spacing. A media field
 * is always an array here, though older values can be one string. A color or token
 * field's `{ token: "" }` (nothing picked yet in Studio) is no value too.
 */
function readValue(atom: AtomSchema, value: unknown) {
  if (value === undefined || value === null) return null
  if (atom.fieldType !== 'spacing' && isPlainObject(value) && Object.keys(value).length === 0) return null
  if ((atom.fieldType === 'color' || atom.fieldType === 'token') && isPlainObject(value) && value.token === '') return null
  if (MEDIA_TYPES.has(atom.fieldType) && typeof value === 'string') return [value]
  return value
}

function readFields(atoms: Record<string, AtomSchema>, values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(atoms).map(([slug, atom]) => [slug, readValue(atom, entry(values, slug))]))
}

interface WireNode {
  uuid?: string
  key?: string
  atoms?: Record<string, unknown>
  children?: unknown
}

function readBlocks(molecules: Map<string, [string, ContainerSchema]>, nodes: unknown): unknown[] {
  if (!Array.isArray(nodes)) return []
  return (nodes as WireNode[]).map((node) => {
    const found = molecules.get(node.uuid ?? '')
    return {
      molecule: found ? found[0] : null,
      uuid: node.uuid,
      key: node.key,
      atoms: found ? readFields(found[1].atoms, node.atoms ?? {}) : node.atoms ?? {},
      children: readBlocks(molecules, node.children)
    }
  })
}

type RowReader = (row: Record<string, unknown>) => Record<string, unknown>

/** Reads a version or list row, with `rootAtoms` by slug. Values are shaped, not validated. */
function contentReader(schema: ProjectSchema, container: ContainerSchema): RowReader {
  const uuids = new Set(Object.values(container.atoms).map(atom => atom.uuid))
  const molecules = new Map(Object.entries(schema.molecules).map(([slug, molecule]) => [molecule.uuid, [slug, molecule] as [string, ContainerSchema]]))
  return (row) => {
    const wire = Array.isArray(row.rootAtoms) ? row.rootAtoms as Schemas['ProjectedRootAtom'][] : []
    const byUuid = new Map(wire.map(atom => [atom.uuid, atom.value]))
    const rootAtoms = Object.fromEntries(Object.entries(container.atoms).map(([slug, atom]) => [slug, readValue(atom, byUuid.get(atom.uuid))]))
    return { ...row, rootAtoms, unmappedRootAtoms: wire.filter(atom => !uuids.has(atom.uuid)), blocks: readBlocks(molecules, row.content) }
  }
}

/** Any answer of the content routes. One that holds no content, like a trash's, is returned as it is. */
function readAnswer(readRow: RowReader, answer: unknown): unknown {
  if (!isPlainObject(answer)) return answer
  const mapped: Record<string, unknown> = { ...answer }
  if (isPlainObject(answer.version)) mapped.version = readRow(answer.version)
  for (const key of ['documents', 'terms']) {
    const page = answer[key]
    if (isPlainObject(page) && Array.isArray(page.results)) {
      mapped[key] = { ...page, results: (page.results as Record<string, unknown>[]).map(readRow) }
    }
  }
  return mapped
}

function containerOf(kind: string, list: Record<string, ContainerSchema>, slug: string) {
  const container = entry(list, slug)
  if (!container) refuse(`This schema has no ${kind} '${slug}'. If the content model changed, run typegen again.`, { [kind]: `Allowed: ${known(Object.keys(list))}` })
  return container
}

interface UntypedContent {
  list(options?: CallOptions): Promise<unknown>
  pages(options?: CallOptions): AsyncGenerator<unknown, void>
  iterate(options?: CallOptions): AsyncGenerator<unknown, void>
  get(slug: string, options?: CallOptions): Promise<unknown>
  create(body: never, options?: CallOptions): Promise<unknown>
  update(slug: string, body: never, options?: CallOptions): Promise<unknown>
  publish(slug: string, options?: CallOptions): Promise<unknown>
  unpublish(slug: string, options?: CallOptions): Promise<unknown>
  trash(slug: string, options?: CallOptions): Promise<unknown>
}

function typedContent(schema: ProjectSchema, container: ContainerSchema, base: UntypedContent, verify: (signal?: AbortSignal) => Promise<void>) {
  const readRow = contentReader(schema, container)
  const read = (answer: unknown) => readAnswer(readRow, answer)
  const toBody = (body: unknown) => mapWriteBody(schema, container, body) as never
  /** Writes are refused in a browser before the check spends a request. */
  const action = (name: 'publish' | 'unpublish' | 'trash') => async (slug: string, options?: CallOptions) => {
    assertWriteAllowed('POST')
    await verify(options?.signal)
    return read(await base[name](slug, options))
  }
  return {
    async list(options?: CallOptions) {
      await verify(options?.signal)
      return read(await base.list(options))
    },
    async* pages(options?: CallOptions) {
      await verify(options?.signal)
      for await (const page of base.pages(options)) yield read(page)
    },
    async* iterate(options?: CallOptions) {
      await verify(options?.signal)
      for await (const row of base.iterate(options)) yield readRow(row as Record<string, unknown>)
    },
    async get(slug: string, options?: CallOptions) {
      await verify(options?.signal)
      return read(await base.get(slug, options))
    },
    async create(body: unknown, options?: CallOptions) {
      assertWriteAllowed('POST')
      const mapped = toBody(body)
      await verify(options?.signal)
      return read(await base.create(mapped, options))
    },
    async update(slug: string, body: unknown, options?: CallOptions) {
      assertWriteAllowed('POST')
      const mapped = toBody(body)
      await verify(options?.signal)
      return read(await base.update(slug, mapped, options))
    },
    publish: action('publish'),
    unpublish: action('unpublish'),
    trash: action('trash')
  }
}

/** Over any `ProjectResources`: documents and terms become typed, and every other resource is unchanged. */
export function typedProject<P extends { documents(slug: string): unknown, terms(slug: string): unknown }>(
  schema: ProjectSchema,
  base: P,
  verify: (signal?: AbortSignal) => Promise<void>
) {
  return {
    ...base,
    documents(doctype: string) {
      return typedContent(schema, containerOf('doctype', schema.doctypes, doctype), base.documents(doctype) as UntypedContent, verify)
    },
    terms(taxonomy: string) {
      return typedContent(schema, containerOf('taxonomy', schema.taxonomies, taxonomy), base.terms(taxonomy) as UntypedContent, verify)
    }
  }
}
