import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createClient, type ProjectResources } from '../src'
import { OPERATION_METHODS } from '../src/operations'

import { describe, expect, it, vi } from 'vitest'

type Spec = { paths: Record<string, Record<string, { operationId?: string }>> }

const spec = JSON.parse(await readFile(join(import.meta.dirname, '..', 'openapi.json'), 'utf8')) as Spec

const routes = new Map(Object.entries(spec.paths).flatMap(([path, methods]) =>
  Object.entries(methods).flatMap(([method, operation]) =>
    operation.operationId ? [[operation.operationId, { method: method.toUpperCase(), path }] as const] : []
  )
))

const table: Record<string, readonly string[]> = OPERATION_METHODS

const BODY = { title: 'T' }
const ITEMS = [{ kind: 'atom', slug: 'a b' }] as const

const CALLS: Record<string, (site: ProjectResources, hv: ReturnType<typeof createClient>) => unknown> = {
  'whoami': (_, hv) => hv.whoami(),
  'orgToken': (_, hv) => hv.orgToken(),
  'projects.list': (_, hv) => hv.projects.list(),
  'projects.pages': (_, hv) => hv.projects.pages(),
  'projects.iterate': (_, hv) => hv.projects.iterate(),
  'documents.list': s => s.documents('a b').list(),
  'documents.pages': s => s.documents('a b').pages(),
  'documents.iterate': s => s.documents('a b').iterate(),
  'documents.get': s => s.documents('a b').get('a b'),
  'documents.create': s => s.documents('a b').create(BODY),
  'documents.update': s => s.documents('a b').update('a b', BODY),
  'documents.publish': s => s.documents('a b').publish('a b'),
  'documents.unpublish': s => s.documents('a b').unpublish('a b'),
  'documents.trash': s => s.documents('a b').trash('a b'),
  'taxonomies.list': s => s.taxonomies.list(),
  'taxonomies.get': s => s.taxonomies.get('a b'),
  'taxonomies.create': s => s.taxonomies.create(BODY as never),
  'taxonomies.update': s => s.taxonomies.update('a b', BODY as never),
  'terms.list': s => s.terms('a b').list(),
  'terms.pages': s => s.terms('a b').pages(),
  'terms.iterate': s => s.terms('a b').iterate(),
  'terms.get': s => s.terms('a b').get('a b'),
  'terms.create': s => s.terms('a b').create(BODY),
  'terms.update': s => s.terms('a b').update('a b', BODY),
  'terms.publish': s => s.terms('a b').publish('a b'),
  'terms.unpublish': s => s.terms('a b').unpublish('a b'),
  'terms.trash': s => s.terms('a b').trash('a b'),
  'doctypes.list': s => s.doctypes.list(),
  'doctypes.get': s => s.doctypes.get('a b'),
  'doctypes.create': s => s.doctypes.create(BODY as never),
  'doctypes.update': s => s.doctypes.update('a b', BODY as never),
  'atoms.list': s => s.atoms.list(),
  'atoms.get': s => s.atoms.get('a b'),
  'atoms.create': s => s.atoms.create(BODY as never),
  'atoms.update': s => s.atoms.update('a b', BODY as never),
  'molecules.list': s => s.molecules.list(),
  'molecules.get': s => s.molecules.get('a b'),
  'molecules.create': s => s.molecules.create(BODY as never),
  'molecules.update': s => s.molecules.update('a b', BODY as never),
  'settings.list': s => s.settings.list(),
  'settings.get': s => s.settings.get('a b'),
  'designTokens.list': s => s.designTokens.list(),
  'designTokens.update': s => s.designTokens.update({} as never),
  'designTokens.schemes': s => s.designTokens.schemes(),
  'designTokens.theme': s => s.designTokens.theme(),
  'designTokens.updateTheme': s => s.designTokens.updateTheme({} as never),
  'designTokens.css': s => s.designTokens.css(),
  'designTokens.w3c': s => s.designTokens.w3c(),
  'library.list': s => s.library.list(),
  'library.plan': s => s.library.plan(ITEMS),
  'library.insert': s => s.library.insert(ITEMS),
  'media.list': s => s.media.list(),
  'media.pages': s => s.media.pages(),
  'media.iterate': s => s.media.iterate(),
  'media.get': s => s.media.get('a b'),
  'media.upload': s => s.media.upload(new Blob(['x'])),
  'media.uploadFromUrl': s => s.media.uploadFromUrl('https://example.test/a.png')
}

/** Enough envelope for any walk to stop after one page. */
const EMPTY_PAGE = { results: [], count: 0, limit: 50, offset: 0, page: 1 }

/** Runs a method, draining it if it is a walk, and answers the one request it made. */
async function requestOf(name: string) {
  const f = vi.fn<typeof fetch>(async () => new Response(
    JSON.stringify({ ...EMPTY_PAGE, documents: EMPTY_PAGE, terms: EMPTY_PAGE, images: EMPTY_PAGE }),
    { headers: { 'content-type': 'application/json' } }
  ))
  const hv = createClient({ token: 'atk_test', org: 'acme', baseUrl: 'https://api.test', fetch: f })
  const result = CALLS[name]!(hv.project('a b'), hv)
  if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
    const walk = (result as AsyncIterable<unknown>)[Symbol.asyncIterator]()
    while (!(await walk.next()).done) { /* drained */ }
  }
  else {
    await result
  }
  expect(f).toHaveBeenCalledOnce()
  const [url, init] = f.mock.calls[0]!
  return { method: init!.method, pathname: new URL(url as string).pathname }
}

describe('the operation table', () => {
  it('names every operationId in the vendored spec, and nothing else', () => {
    expect([...routes.keys()].sort()).toEqual(Object.keys(table).sort())
  })

  it('has a call in this test for exactly the methods it lists', () => {
    expect(Object.values(table).flat().sort()).toEqual(Object.keys(CALLS).sort())
  })

  it.each(Object.entries(table).flatMap(([id, methods]) => methods.map(method => [method, id] as const)))('%s calls %s', async (method, id) => {
    const route = routes.get(id)!
    const expected = `/v1${route.path}`
      .replace('{org_id}', 'acme')
      .replace(/\{[^}]+\}/g, 'a%20b')
    expect(await requestOf(method)).toEqual({ method: route.method, pathname: expected })
  })
})
