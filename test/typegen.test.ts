import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { compileGenerated } from '../scripts/lib/compile-generated.mjs'
import { run } from '../src/cli/run'
import { createClient } from '../src/client'
import { defineSchema, type ProjectSchema, type SchemaTypes } from '../src/schema'
import { type Catalog, FIELD_TYPE_MAPPINGS, fieldTsType, renderSchema } from '../src/typegen'

import ts from 'typescript'
import { describe, expect, it, vi } from 'vitest'

const spec = JSON.parse(await readFile(join(import.meta.dirname, '..', 'openapi.json'), 'utf8'))
const FIELD_TYPES: string[] = spec.components.schemas.AtomWrite.properties.fieldType.enum

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const PROJECT = { uuid: uuid(1), slug: 'site' }

const atoms = FIELD_TYPES.map((fieldType, i) => ({
  uuid: uuid(100 + i),
  slug: `${fieldType}-field`,
  fieldType,
  multiple: 0,
  ...(fieldType === 'select' ? { fieldConfig: { options: ['small', { value: 'large', text: 'Large' }] } } : {})
}))
const atomUuid = (fieldType: string) => atoms.find(atom => atom.fieldType === fieldType)!.uuid

const catalog: Catalog = {
  project: PROJECT,
  status: 'published',
  atoms: [...atoms, { uuid: uuid(90), slug: 'tags', fieldType: 'text', multiple: 1 }],
  molecules: [
    { uuid: uuid(20), slug: 'card', atoms: [{ uuid: atomUuid('text') }], supports: [] },
    { uuid: uuid(21), slug: 'hero', atoms: [{ uuid: atomUuid('number') }], supports: [uuid(20), uuid(21)] }
  ],
  doctypes: [{ uuid: uuid(30), slug: 'post', atoms: [...atoms.map(({ uuid }) => ({ uuid })), { uuid: uuid(90) }], supports: [uuid(21)] }],
  taxonomies: [{ uuid: uuid(40), slug: 'topic', atoms: [{ uuid: atomUuid('text') }], supports: [] }]
}

const USAGE = `
import { createClient } from '@hypervalent-io/sdk'
import { schema } from './schema'

const site = createClient({ token: 'atk_x', schema }).project()
const posts = site.documents('post')

export async function ok() {
  const { version } = await posts.get('a')
  const text: string | null | undefined = version?.rootAtoms['text-field']
  const count: number | null | undefined = version?.rootAtoms['number-field']
  const flag: boolean | null | undefined = version?.rootAtoms['boolean-field']
  const size: 'small' | 'large' | null | undefined = version?.rootAtoms['select-field']
  const hero: string[] | null | undefined = version?.rootAtoms['image-field']
  const tags: string[] | null | undefined = version?.rootAtoms.tags
  const side = version?.rootAtoms['spacing-field']?.top
  const top: number | undefined = typeof side === 'number' ? side : undefined
  const step: string | undefined = typeof side === 'object' ? side.token : undefined
  const accent = version?.rootAtoms['color-field']
  const accentToken: string | undefined = typeof accent === 'object' && accent !== null ? accent.token : undefined
  const corner: string | undefined = version?.rootAtoms['token-field']?.token
  for (const block of version?.blocks ?? []) {
    if (block.molecule === 'hero') {
      const value: number | null = block.atoms['number-field']
      void value
    }
  }
  for await (const row of posts.iterate()) void row.rootAtoms['date-field']
  await posts.create({
    title: 'x',
    rootAtoms: { 'text-field': 'x', 'color-field': { token: 'primary' }, 'token-field': { token: 'corner-medium' }, 'number-field': 1, 'select-field': 'large', 'image-field': ['u'], 'tags': ['a'], 'spacing-field': { top: 1, bottom: { token: 'xl' } }, 'date-field': null },
    blocks: [{ molecule: 'hero', atoms: { 'number-field': 1 }, children: [{ molecule: 'card', atoms: { 'text-field': 'x' } }, { molecule: 'hero' }] }]
  })
  await site.terms('topic').update('t', { rootAtoms: { 'text-field': 'x' } })
  await site.atoms.list()
  return [text, count, flag, size, hero, tags, top, step, accentToken, corner]
}

export async function refused() {
  // @ts-expect-error not a field
  await posts.create({ title: 'x', rootAtoms: { nope: 1 } })
  // @ts-expect-error a colour is a string or { token }
  await posts.create({ title: 'x', rootAtoms: { 'color-field': { hex: '#fff' } } })
  // @ts-expect-error a token field takes { token }, not a CSS value
  await posts.create({ title: 'x', rootAtoms: { 'token-field': '12px' } })
  // @ts-expect-error a spacing side is pixels or { token }, not a CSS string
  await posts.create({ title: 'x', rootAtoms: { 'spacing-field': { top: '16px' } } })
  // @ts-expect-error a number field
  await posts.create({ title: 'x', rootAtoms: { 'number-field': 'one' } })
  // @ts-expect-error not an option
  await posts.create({ title: 'x', rootAtoms: { 'select-field': 'medium' } })
  // @ts-expect-error media is an array
  await posts.create({ title: 'x', rootAtoms: { 'image-field': 'u' } })
  // @ts-expect-error card is not allowed at the top
  await posts.create({ title: 'x', blocks: [{ molecule: 'card' }] })
  // @ts-expect-error card has no children
  await posts.create({ title: 'x', blocks: [{ molecule: 'hero', children: [{ molecule: 'card', children: [{ molecule: 'card' }] }] }] })
  // @ts-expect-error not a field of hero
  await posts.create({ title: 'x', blocks: [{ molecule: 'hero', atoms: { 'text-field': 'x' } }] })
  // @ts-expect-error not a document type
  site.documents('nope')
  // @ts-expect-error writes take slugs through blocks, not the raw tree
  await posts.create({ title: 'x', content: [] })
}
`

describe('the field type mapping', () => {
  it('covers exactly the types the spec lists', () => {
    expect(FIELD_TYPES.length).toBeGreaterThan(0)
    expect(Object.keys(FIELD_TYPE_MAPPINGS).sort()).toEqual([...FIELD_TYPES].sort())
  })

  it('makes media an array whether or not it is multiple, and scalars only when multiple', () => {
    const atom = (fieldType: string, multiple: number | boolean) => ({ uuid: 'u', slug: 's', fieldType, multiple })
    for (const type of ['image', 'file', 'video']) expect(fieldTsType(atom(type, 0))).toBe('string[]')
    expect(fieldTsType(atom('image', 1))).toBe('string[]')
    expect(fieldTsType(atom('text', 0))).toBe('string')
    expect(fieldTsType(atom('text', 1))).toBe('string[]')
    expect(fieldTsType(atom('number', true))).toBe('number[]')
    expect(fieldTsType({ ...atom('select', 1), fieldConfig: { options: ['a', 'b'] } })).toBe('("a" | "b")[]')
    expect(fieldTsType(atom('select', 0))).toBe('string')
    expect(fieldTsType(atom('color', 0))).toBe('string | ColorTokenRef')
    expect(fieldTsType(atom('color', 1))).toBe('(string | ColorTokenRef)[]')
    expect(fieldTsType(atom('token', 0))).toBe('TokenRef')
    expect(fieldTsType({ ...atom('select', 0), fieldConfig: { options: [{ value: 1 }, { value: 2 }, 'a'] } })).toBe('1 | 2 | "a"')
    expect(fieldTsType(atom('brand-new', 0))).toBeNull()
  })
})

describe('renderSchema', () => {
  it('compiles under strict for a project using every field type, and refuses misuse', () => {
    const { source, warnings } = renderSchema(catalog)
    expect(warnings).toEqual([])
    expect(compileGenerated(ts, { 'schema.ts': source, 'usage.ts': USAGE })).toEqual([])
  }, 60_000)

  it('catches a type error in the usage, so the compile check cannot pass by accident', () => {
    const { source } = renderSchema(catalog)
    const broken = compileGenerated(ts, { 'schema.ts': source, 'usage.ts': `${USAGE}\nexport const n: number = 'x'\n` })
    expect(broken).toHaveLength(1)
  }, 60_000)

  it('compiles with no spacing field and an empty project', () => {
    const empty = renderSchema({ ...catalog, atoms: [], molecules: [], doctypes: [], taxonomies: [] })
    expect(empty.source).not.toContain('SpacingValue')
    expect(empty.source).not.toContain('ColorTokenRef')
    expect(empty.source).not.toContain('TokenRef')
    expect(compileGenerated(ts, { 'schema.ts': empty.source })).toEqual([])
  }, 60_000)

  it('imports SpacingValue for a spacing field only, not for an option that spells it', () => {
    const { source } = renderSchema({
      ...catalog,
      atoms: [{ uuid: uuid(5), slug: 'x', fieldType: 'select', multiple: 0, fieldConfig: { options: ['SpacingValue'] } }],
      molecules: [],
      taxonomies: [],
      doctypes: [{ uuid: uuid(30), slug: 'post', atoms: [{ uuid: uuid(5) }], supports: [] }]
    })
    expect(source).toContain(`import { defineSchema } from`)
  })

  it('is the same bytes whatever order the API answers in', () => {
    const shuffled = { ...catalog, molecules: [...catalog.molecules].reverse(), doctypes: catalog.doctypes.map(d => ({ ...d, atoms: [...d.atoms].reverse() })) }
    expect(renderSchema(shuffled).source).toBe(renderSchema(catalog).source)
  })

  it('quotes content into the output rather than trusting it', () => {
    const { source } = renderSchema({
      ...catalog,
      atoms: [{ uuid: uuid(5), slug: 'x', fieldType: 'select', multiple: 0, fieldConfig: { options: ['"; process.exit(1); //', '*/'] } }],
      molecules: [],
      taxonomies: [],
      doctypes: [{ uuid: uuid(30), slug: 'post', atoms: [{ uuid: uuid(5) }], supports: [] }]
    })
    expect(compileGenerated(ts, { 'schema.ts': source })).toEqual([])
    expect(source).toContain('"\\"; process.exit(1); //"')
  }, 60_000)

  it('warns about what it cannot place, and types an unknown field type unknown', () => {
    const { source, warnings } = renderSchema({
      ...catalog,
      atoms: [{ uuid: uuid(5), slug: 'x', fieldType: 'hologram', multiple: 0 }],
      molecules: [],
      taxonomies: [],
      doctypes: [{ uuid: uuid(30), slug: 'post', atoms: [{ uuid: uuid(5) }, { uuid: uuid(6) }], supports: [uuid(7)] }]
    })
    expect(source).toContain('"x": unknown')
    expect(warnings).toHaveLength(3)
  })
})

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** A fake API: one org-wide token, one project, one document, recording what it is sent. */
function api(projects: { uuid: string, slug: string, title?: string }[] = [{ ...PROJECT, title: 'Site' }]) {
  const sent: { method: string, path: string, body: unknown }[] = []
  const version = {
    uuid: uuid(60),
    rootAtoms: [
      { uuid: atomUuid('text'), value: 'Hello', locked: 0, required: 0 },
      { uuid: atomUuid('image'), value: 'one-uuid', locked: 0, required: 0 },
      { uuid: atomUuid('date'), value: {}, locked: 0, required: 0 },
      { uuid: atomUuid('spacing'), value: { top: 8, right: null, bottom: { token: '' }, left: { token: 'xl' } }, locked: 0, required: 0 },
      { uuid: atomUuid('color'), value: { token: '' }, locked: 0, required: 0 },
      { uuid: atomUuid('token'), value: { token: '' }, locked: 0, required: 0 },
      { uuid: uuid(999), value: 'added since', locked: 0, required: 0 }
    ],
    content: [{ uuid: uuid(21), key: 'k1', atoms: { 'number-field': 3 }, children: [{ uuid: uuid(888), key: 'k2', atoms: { a: 1 }, children: [] }] }]
  }
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const method = init?.method ?? 'GET'
    sent.push({ method, path: url.pathname, body: init?.body ? JSON.parse(String(init.body)) : undefined })
    if (url.pathname === '/v1/token') return json({ token: { projectSlug: null }, org: { slug: 'acme' } })
    if (url.pathname.endsWith('/projects')) return json({ results: projects, count: projects.length, limit: 50, offset: 0, page: 1 })
    if (url.pathname.endsWith('/documents') && method === 'GET') {
      return json({ documents: { results: [{ ...version, slug: 'a', uuid: uuid(61) }], count: 1, limit: 50, offset: 0, page: 1 } })
    }
    if (url.pathname.endsWith('/trash')) return json({ trashed: true })
    return json({ document: { slug: 'a' }, version, taxonomies: [], referencedImages: [], referencedFiles: [] })
  }) as unknown as typeof globalThis.fetch
  return { fetch, sent }
}

const schema = renderSchema(catalog).schema as ProjectSchema<SchemaTypes>
const typed = (fetch: typeof globalThis.fetch) => {
  const hv = createClient({ token: 'atk_x', org: 'acme', fetch, schema, maxRetries: 0 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the runtime half: the types have their own test above
  return hv as unknown as { project(slug?: string): { documents(slug: string): any, terms(slug: string): any, atoms: { list(): Promise<unknown> } } }
}

describe('a client with a schema', () => {
  it('maps a write from slugs to uuids, leaving molecule atoms by slug', async () => {
    const { fetch, sent } = api()
    await typed(fetch).project().documents('post').create({
      title: 'x',
      rootAtoms: { 'text-field': 'Hi', 'tags': ['a'] },
      blocks: [{ molecule: 'hero', atoms: { 'number-field': 2 }, key: 'keep', children: [{ molecule: 'card' }] }]
    })
    expect(sent.at(-1)).toEqual({
      method: 'POST',
      path: '/v1/orgs/acme/projects/site/doctypes/post/documents',
      body: {
        title: 'x',
        rootAtoms: { [atomUuid('text')]: 'Hi', [uuid(90)]: ['a'] },
        content: [{ uuid: uuid(21), key: 'keep', atoms: { 'number-field': 2 }, children: [{ uuid: uuid(20), atoms: {}, children: [] }] }]
      }
    })
  })

  it('reads a field whose slug is an Object.prototype member as null, not the inherited member', async () => {
    const withConstructor = renderSchema({
      ...catalog,
      atoms: [{ uuid: uuid(5), slug: 'constructor', fieldType: 'text', multiple: 0 }],
      molecules: [{ uuid: uuid(21), slug: 'hero', atoms: [{ uuid: uuid(5) }], supports: [] }],
      doctypes: [{ uuid: uuid(30), slug: 'post', atoms: [], supports: [uuid(21)] }],
      taxonomies: []
    }).schema
    const { fetch } = api()
    const hv = createClient({ token: 'atk_x', org: 'acme', fetch, schema: withConstructor, maxRetries: 0 }) as unknown as ReturnType<typeof typed>
    const { version } = await hv.project().documents('post').get('a')
    expect(version.blocks[0].atoms).toEqual({ constructor: null })
  })

  it('refuses a bad write before any request, naming every problem', async () => {
    const { fetch, sent } = api()
    const error = await typed(fetch).project().documents('post').create({
      title: 'x',
      rootAtoms: { nope: 1, [atomUuid('text')]: 'by uuid' },
      blocks: [{ molecule: 'card' }, { molecule: 'hero', atoms: { nope: 1 }, children: [{ molecule: 'ghost' }] }]
    }).catch((e: unknown) => e)
    expect(error).toMatchObject({ status: 0, code: 'SCHEMA_VALIDATION' })
    expect(Object.keys(error.fields).sort()).toEqual([
      `rootAtoms.${atomUuid('text')}`,
      'blocks[0].molecule',
      'blocks[1].atoms.nope',
      'blocks[1].children[0].molecule',
      'rootAtoms.nope'
    ].sort())
    expect(sent).toEqual([])
  })

  it('refuses a slug that only an inherited property would match', async () => {
    const { fetch } = api()
    const docs = typed(fetch).project().documents('post')
    await expect(docs.create({ title: 'x', rootAtoms: { constructor: 1 } })).rejects.toMatchObject({ code: 'SCHEMA_VALIDATION' })
    expect(() => typed(fetch).project().documents('constructor')).toThrowError(/no doctype/)
  })

  it('refuses blocks beside a raw content tree', async () => {
    const { fetch } = api()
    await expect(typed(fetch).project().documents('post').create({ title: 'x', content: [], blocks: [] })).rejects.toMatchObject({ code: 'SCHEMA_VALIDATION' })
  })

  it('reads by slug, shaping values and keeping what the schema does not know', async () => {
    const { fetch } = api()
    const { version } = await typed(fetch).project().documents('post').get('a')
    expect(version.rootAtoms['text-field']).toBe('Hello')
    expect(version.rootAtoms['image-field'], 'one string becomes an array').toEqual(['one-uuid'])
    expect(version.rootAtoms['date-field'], '{} means no value').toBeNull()
    expect(version.rootAtoms['spacing-field'], 'a null or unpicked side is dropped').toEqual({ top: 8, left: { token: 'xl' } })
    expect(version.rootAtoms['color-field'], 'an unpicked token is no value').toBeNull()
    expect(version.rootAtoms['token-field'], 'an unpicked token field is no value').toBeNull()
    expect(version.rootAtoms['number-field'], 'a field the read lacks').toBeNull()
    expect(version.unmappedRootAtoms.map((atom: { uuid: string }) => atom.uuid)).toEqual([uuid(999)])
    expect(version.content[0].uuid, 'the raw tree is left alone').toBe(uuid(21))
    expect(version.blocks).toEqual([{
      molecule: 'hero',
      uuid: uuid(21),
      key: 'k1',
      atoms: { 'number-field': 3 },
      children: [{ molecule: null, uuid: uuid(888), key: 'k2', atoms: { a: 1 }, children: [] }]
    }])
  })

  it('maps list, pages and iterate rows, and leaves a trash answer alone', async () => {
    const { fetch } = api()
    const docs = typed(fetch).project().documents('post')
    expect((await docs.list()).documents.results[0].rootAtoms['text-field']).toBe('Hello')
    for await (const page of docs.pages()) expect(page.documents.results[0].rootAtoms['text-field']).toBe('Hello')
    for await (const row of docs.iterate()) expect(row.rootAtoms['text-field']).toBe('Hello')
    expect(await docs.trash('a')).toEqual({ trashed: true })
  })

  it('checks the project once per client, before the first content call only', async () => {
    const { fetch, sent } = api()
    const hv = typed(fetch)
    await hv.project().documents('post').get('a')
    await hv.project().documents('post').get('b')
    await hv.project('site').terms('topic').get('t')
    expect(sent.filter(call => call.path.endsWith('/projects'))).toHaveLength(1)
  })

  describe('in another project', () => {
    it('refuses a project with another slug, reads and writes alike, and sends no content call', async () => {
      const { fetch, sent } = api([{ uuid: uuid(2), slug: 'other' }])
      const docs = typed(fetch).project('other').documents('post')
      await expect(docs.create({ title: 'x', rootAtoms: { 'text-field': 'Hi' } })).rejects.toMatchObject({ status: 0, code: 'SCHEMA_PROJECT_MISMATCH' })
      await expect(docs.get('a')).rejects.toMatchObject({ code: 'SCHEMA_PROJECT_MISMATCH' })
      await expect(docs.publish('a')).rejects.toMatchObject({ code: 'SCHEMA_PROJECT_MISMATCH' })
      await expect(docs.iterate().next()).rejects.toMatchObject({ code: 'SCHEMA_PROJECT_MISMATCH' })
      expect(sent.every(call => call.path.endsWith('/projects') && call.method === 'GET')).toBe(true)
    })

    it('refuses a project with the same slug and another uuid', async () => {
      const { fetch, sent } = api([{ uuid: uuid(2), slug: 'site' }])
      await expect(typed(fetch).project().documents('post').create({ title: 'x' })).rejects.toThrowError(/generated for project 'site'/)
      expect(sent.some(call => call.method === 'POST')).toBe(false)
    })

    it('passes a project renamed since, once it is named, because the uuid is what counts', async () => {
      const { fetch } = api([{ uuid: PROJECT.uuid, slug: 'renamed' }])
      await expect(typed(fetch).project().documents('post').get('a')).rejects.toMatchObject({ code: 'SCHEMA_PROJECT_MISMATCH' })
      await expect(typed(fetch).project('renamed').documents('post').get('a')).resolves.toBeTruthy()
    })

    it('leaves the structure resources alone', async () => {
      const { fetch } = api([{ uuid: uuid(2), slug: 'other' }])
      await expect(typed(fetch).project('other').atoms.list()).resolves.toBeTruthy()
    })
  })

  it('leaves a client without a schema untyped and unchecked', async () => {
    const { fetch, sent } = api()
    const hv = createClient({ token: 'atk_x', org: 'acme', fetch })
    await hv.project('site').documents('post').create({ title: 'x', rootAtoms: { anything: 1 } })
    expect(sent).toEqual([expect.objectContaining({ method: 'POST', body: { title: 'x', rootAtoms: { anything: 1 } } })])
  })

  it('accepts defineSchema output and hands it back', () => {
    const defined = defineSchema({ version: 1, project: PROJECT, status: 'published', doctypes: {}, taxonomies: {}, molecules: {} })
    expect(createClient({ token: 'atk_x', schema: defined }).schema).toBe(defined)
  })
})

describe('the CLI', () => {
  const io = (env: Record<string, string> = { HYPERVALENT_TOKEN: 'atk_secret' }) => {
    const out: string[] = []
    const err: string[] = []
    return { out, err, env, stdout: (t: string) => out.push(t), stderr: (t: string) => err.push(t) }
  }

  /** The catalog routes on top of the project list. */
  const routes = (status?: string, scope = 'read_write', apiTokensWrite = true) => vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input))
    if (status) expect(url.pathname.endsWith('/projects') || url.pathname === '/v1/token' || url.searchParams.get('status') === status).toBe(true)
    if (url.pathname === '/v1/token') return json({ token: { projectSlug: null, scope }, org: { slug: 'acme' }, features: { apiTokensWrite } })
    if (url.pathname.endsWith('/projects')) return json({ results: [{ ...PROJECT, title: 'Site' }], count: 1, limit: 50, offset: 0, page: 1 })
    if (url.pathname.endsWith('/atoms')) return json({ results: catalog.atoms, count: 1 })
    if (url.pathname.endsWith('/molecules')) return json({ results: catalog.molecules, count: 2 })
    if (url.pathname.endsWith('/doctypes')) return json({ results: catalog.doctypes, count: 1 })
    if (url.pathname.endsWith('/taxonomies')) return json({ results: catalog.taxonomies, count: 1 })
    return json({ status: 404, code: 'NOT_FOUND', message: 'nope' }, 404)
  }) as unknown as typeof globalThis.fetch

  it('writes the schema, creating directories', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'sdk-cli-'))
    try {
      const out = join(dir, 'a', 'b', 'schema.ts')
      const streams = io()
      expect(await run(['typegen', '--project', 'site', '--out', out], { ...streams, fetch: routes() })).toBe(0)
      expect(await readFile(out, 'utf8')).toBe(renderSchema(catalog).source)
      expect(streams.err).toEqual([])
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('sends --status to every structure read', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'sdk-cli-'))
    try {
      expect(await run(['typegen', '--project', 'site', '--out', join(dir, 's.ts'), '--status', 'draft'], { ...io(), fetch: routes('draft') })).toBe(0)
      expect(await readFile(join(dir, 's.ts'), 'utf8')).toContain('"status": "draft"')
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('fails with a message for bad usage, a missing token and an API refusal, never printing the token', async () => {
    const usage = io()
    expect(await run(['typegen'], usage)).toBe(1)
    expect(usage.err.join('')).toContain('--out is required')
    expect(await run(['nonsense'], io())).toBe(1)
    expect(await run(['typegen', '--out', 'x', '--status', 'live'], io())).toBe(1)
    const noToken = io({})
    expect(await run(['typegen', '--out', 'x'], noToken)).toBe(1)
    expect(noToken.err.join('')).toContain('HYPERVALENT_TOKEN')

    const refused = io()
    const fetch = (async () => json({ status: 401, code: 'INVALID_API_TOKEN', message: 'Bad token' }, 401)) as unknown as typeof globalThis.fetch
    expect(await run(['typegen', '--project', 'site', '--out', '/nonexistent/x.ts'], { ...refused, fetch })).toBe(1)
    expect(refused.err.join('')).toContain('INVALID_API_TOKEN')
    expect(refused.err.join('')).not.toContain('atk_secret')
  })

  it('refuses --status draft on a read token, which the API would refuse with a 403', async () => {
    const streams = io()
    expect(await run(['typegen', '--project', 'site', '--out', '/nonexistent/x.ts', '--status', 'draft'], { ...streams, fetch: routes(undefined, 'read') })).toBe(1)
    expect(streams.err.join('')).toContain('TOKEN_SCOPE_READ_ONLY')
  })

  it('refuses --status draft on a read_write token whose plan has no API writes, which the API also refuses', async () => {
    const streams = io()
    expect(await run(['typegen', '--project', 'site', '--out', '/nonexistent/x.ts', '--status', 'draft'], { ...streams, fetch: routes(undefined, 'read_write', false) })).toBe(1)
    expect(streams.err.join('')).toContain('TOKEN_SCOPE_READ_ONLY')
  })

  it('names a project the token cannot see', async () => {
    const streams = io()
    expect(await run(['typegen', '--project', 'ghost', '--out', '/nonexistent/x.ts'], { ...streams, fetch: routes() })).toBe(1)
    expect(streams.err.join('')).toContain(`'ghost'`)
  })
})
