import { type ClientOptions, createClient, isHypervalentError, resolveFieldMedia } from '../src'

import { afterEach, describe, expect, it, vi } from 'vitest'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const client = (f: typeof fetch, options: Partial<ClientOptions> = {}) =>
  createClient({ token: 'atk_test', org: 'acme', baseUrl: 'https://api.test', fetch: f, ...options })

const row = (uuid: string) => ({ uuid })

/** A document list answer. `offset` follows the page, as the API's does. */
const documentPage = (rows: unknown[], page: number, count: number, limit = 2) => ({
  documentType: {},
  documents: { results: rows, count, limit, offset: (page - 1) * limit, page },
  referencedImages: [{ uuid: `image-${page}` }],
  referencedFiles: []
})

function fakeFetch(...answers: unknown[]) {
  let call = 0
  return vi.fn<typeof fetch>(async () => json(answers[Math.min(call++, answers.length - 1)]))
}

const urlOf = (f: ReturnType<typeof fakeFetch>, call = 0) => new URL(f.mock.calls[call]![0] as string)
const initOf = (f: ReturnType<typeof fakeFetch>, call = 0) => f.mock.calls[call]![1]!

const collect = async <T>(walk: AsyncIterable<T>) => {
  const all: T[] = []
  for await (const item of walk) all.push(item)
  return all
}

afterEach(() => vi.unstubAllGlobals())

describe('list()', () => {
  it.each([
    ['documents', (hv: ReturnType<typeof client>) => hv.project('p').documents('post').list({ limit: 2 }), documentPage([row('a'), row('b')], 1, 9)],
    ['terms', (hv: ReturnType<typeof client>) => hv.project('p').terms('tag').list({ limit: 2 }), { terms: { results: [row('a')], count: 9, limit: 2, offset: 0, page: 1 } }],
    ['projects', (hv: ReturnType<typeof client>) => hv.projects.list({ limit: 2 }), { results: [row('a')], count: 9, limit: 2, offset: 0, page: 1 }]
  ])('makes exactly one request for %s even when more pages exist, and answers the envelope', async (_name, call, answer) => {
    const f = fakeFetch(answer)
    expect(await call(client(f))).toEqual(answer)
    expect(f).toHaveBeenCalledOnce()
  })

  it('passes the query the spec names, and leaves the page size to the API', async () => {
    const f = fakeFetch(documentPage([], 1, 0))
    await client(f).project('p').documents('post').list({ status: 'draft', page: 3 })
    expect(urlOf(f).search).toBe('?status=draft&page=3')
  })
})

describe('pages()', () => {
  it('yields each envelope, carrying that page\'s references', async () => {
    const f = fakeFetch(documentPage([row('a'), row('b')], 1, 3), documentPage([row('c')], 2, 3))
    const pages = await collect(client(f).project('p').documents('post').pages({ limit: 2 }))
    expect(pages.map(p => p.referencedImages[0]!.uuid)).toEqual(['image-1', 'image-2'])
    expect(f).toHaveBeenCalledTimes(2)
    expect(urlOf(f, 1).search).toBe('?limit=2&page=2')
  })

  it('asks for the maximum page size by default', async () => {
    const f = fakeFetch(documentPage([], 1, 0))
    await collect(client(f).project('p').documents('post').pages())
    expect(urlOf(f).searchParams.get('limit')).toBe('50')
  })

  it('stops on an empty page even if count says there is more', async () => {
    const f = fakeFetch(documentPage([row('a')], 1, 5), documentPage([], 2, 5))
    await collect(client(f).project('p').documents('post').pages())
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('drops an offset, which earlier specs said wins over the page and would never finish', async () => {
    const f = fakeFetch(documentPage([row('a')], 1, 1))
    await collect(client(f).project('p').documents('post').pages({ offset: 5 } as never))
    expect(urlOf(f).searchParams.has('offset')).toBe(false)
  })

  it('throws rather than spin when an answer does not move forward', async () => {
    const f = fakeFetch(documentPage([row('a')], 1, 9))
    await expect(collect(client(f).project('p').documents('post').iterate())).rejects.toMatchObject({ code: 'UNEXPECTED_RESPONSE' })
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('keeps the default page size when given an undefined limit', async () => {
    const f = fakeFetch(documentPage([], 1, 0))
    await collect(client(f).project('p').documents('post').pages({ limit: undefined } as never))
    expect(urlOf(f).searchParams.get('limit')).toBe('50')
  })

  it('stops requesting when the caller stops reading', async () => {
    const f = fakeFetch(documentPage([row('a'), row('b')], 1, 9))
    for await (const document of client(f).project('p').documents('post').iterate({ limit: 2 })) {
      expect(document.uuid).toBe('a')
      break
    }
    expect(f).toHaveBeenCalledOnce()
  })
})

describe('iterate()', () => {
  it('walks every page and yields no duplicate when a row insert shifts a page boundary', async () => {
    // A row inserted before "b" after page 1 was read pushes "b" onto page 2.
    const f = fakeFetch(
      documentPage([row('a'), row('b')], 1, 4),
      documentPage([row('b'), row('c')], 2, 5),
      documentPage([row('d')], 3, 5)
    )
    const rows = await collect(client(f).project('p').documents('post').iterate({ limit: 2 }))
    expect(rows.map(r => r.uuid)).toEqual(['a', 'b', 'c', 'd'])
    expect(f).toHaveBeenCalledTimes(3)
  })

  it('reads terms from the taxonomy route across pages', async () => {
    const page = (rows: unknown[], n: number) => ({ taxonomy: {}, terms: { results: rows, count: 3, limit: 2, offset: (n - 1) * 2, page: n }, referencedImages: [], referencedFiles: [] })
    const f = fakeFetch(page([row('a'), row('b')], 1), page([row('c')], 2))
    const rows = await collect(client(f).project('p').terms('tag').iterate({ limit: 2, status: 'draft' }))
    expect(rows.map(r => r.uuid)).toEqual(['a', 'b', 'c'])
    expect(urlOf(f, 1).pathname).toBe('/v1/orgs/acme/projects/p/taxonomies/tag')
    expect(urlOf(f, 1).search).toBe('?limit=2&status=draft&page=2')
  })

  it('walks the project list, whose envelope is the answer itself', async () => {
    const f = fakeFetch({ results: [row('a')], count: 2, limit: 1, offset: 0, page: 1 }, { results: [row('b')], count: 2, limit: 1, offset: 1, page: 2 })
    expect((await collect(client(f).projects.iterate({ limit: 1 }))).map(r => r.uuid)).toEqual(['a', 'b'])
  })
})

describe('list filters', () => {
  const documents = (f: typeof fetch) => client(f).project('p').documents('post')

  it('sends sort, taxonomy and term as the spec names them', async () => {
    const f = fakeFetch(documentPage([], 1, 0))
    await documents(f).list({ sort: '-datePublished', taxonomy: 'topics', term: 'news' })
    expect(urlOf(f).search).toBe('?sort=-datePublished&taxonomy=topics&term=news')
  })

  it('percent-encodes a + offset in modifiedSince, which the API would read as a space', async () => {
    const f = fakeFetch(documentPage([], 1, 0))
    await documents(f).list({ modifiedSince: '2026-01-31T09:30:00+02:00' })
    expect(urlOf(f).search).toBe('?modifiedSince=2026-01-31T09%3A30%3A00%2B02%3A00')
    expect(urlOf(f).searchParams.get('modifiedSince')).toBe('2026-01-31T09:30:00+02:00')
  })

  it('sends a Date as its ISO 8601 UTC instant', async () => {
    const f = fakeFetch(documentPage([], 1, 0))
    await documents(f).list({ modifiedSince: new Date(Date.UTC(2026, 0, 31, 9, 30)) })
    expect(urlOf(f).searchParams.get('modifiedSince')).toBe('2026-01-31T09:30:00.000Z')
  })

  it('refuses an invalid Date with a TypeError naming the parameter, and sends nothing', async () => {
    const f = fakeFetch(documentPage([], 1, 0))
    await expect(documents(f).list({ modifiedSince: new Date('not a date') })).rejects.toThrow(new TypeError('modifiedSince must be a valid Date'))
    expect(f).not.toHaveBeenCalled()
  })

  it('keeps every filter on every page of a walk', async () => {
    const f = fakeFetch(documentPage([row('a'), row('b')], 1, 3), documentPage([row('c')], 2, 3))
    const since = new Date(Date.UTC(2026, 0, 31))
    const rows = await collect(documents(f).iterate({ limit: 2, sort: 'title', taxonomy: 'topics', term: 'news', modifiedSince: since }))
    expect(rows.map(r => r.uuid)).toEqual(['a', 'b', 'c'])
    for (const call of [0, 1]) {
      const params = urlOf(f, call).searchParams
      expect([params.get('sort'), params.get('taxonomy'), params.get('term'), params.get('modifiedSince'), params.get('page')])
        .toEqual(['title', 'topics', 'news', '2026-01-31T00:00:00.000Z', String(call + 1)])
    }
  })

  it('passes modifiedSince to a term list, through list() and pages()', async () => {
    const page = { taxonomy: {}, terms: { results: [], count: 0, limit: 50, offset: 0, page: 1 }, referencedImages: [], referencedFiles: [] }
    const f = fakeFetch(page)
    const terms = client(f).project('p').terms('tag')
    await terms.list({ modifiedSince: new Date(Date.UTC(2026, 0, 31)) })
    await collect(terms.pages({ modifiedSince: '2026-01-31T00:00:00Z', status: 'draft' }))
    expect(urlOf(f, 0).search).toBe('?modifiedSince=2026-01-31T00%3A00%3A00.000Z')
    expect(urlOf(f, 1).searchParams.get('modifiedSince')).toBe('2026-01-31T00:00:00Z')
    expect(urlOf(f, 1).searchParams.get('status')).toBe('draft')
  })

  it('types the filters each list takes, and refuses the rest', () => {
    // Compile-time only (`npm run typecheck`): never called.
    const typed = (hv: ReturnType<typeof client>) => {
      const posts = hv.project('p').documents('post')
      const tags = hv.project('p').terms('tag')
      void posts.list({ sort: 'dateModified', taxonomy: 't', term: 'x', modifiedSince: new Date() })
      void posts.pages({ sort: '-title', modifiedSince: '2026-01-31T00:00:00Z' })
      void tags.iterate({ modifiedSince: new Date() })
      // @ts-expect-error not one of the listed orders
      void posts.list({ sort: 'slug' })
      // @ts-expect-error modifiedSince is a string or a Date
      void posts.list({ modifiedSince: 1767225600000 })
      // @ts-expect-error a term list has no sort
      void tags.list({ sort: 'title' })
      // @ts-expect-error a term list is not filtered by term
      void tags.list({ term: 'x' })
      // @ts-expect-error the project list has no modifiedSince
      void hv.projects.list({ modifiedSince: new Date() })
    }
    expect(typed).toBeTypeOf('function')
  })
})

describe('root atoms', () => {
  it('passes both shapes through untouched: an array on read, a uuid-keyed object on write', async () => {
    const read = { document: {}, version: { rootAtoms: [{ uuid: 'atom-1', value: 'x', locked: 0, required: 1, condition: null }] }, taxonomies: [], referencedImages: [], referencedFiles: [] }
    const f = fakeFetch(read)
    const docs = client(f).project('p').documents('post')
    expect(await docs.get('hello')).toEqual(read)

    const write = { rootAtoms: { 'atom-1': 'y' }, content: [{ uuid: 'node', atoms: { headline: 'z' } }] }
    expect(await docs.update('hello', write)).toEqual(read)
    expect(JSON.parse(initOf(f, 1).body as string)).toEqual(write)
  })
})

describe('slugs', () => {
  it('encodes every segment, including the org', async () => {
    const f = fakeFetch({})
    await client(f, { org: 'a/b' }).project('p/q').documents('d?e').get('s#t')
    expect(f.mock.calls[0]![0]).toBe('https://api.test/v1/orgs/a%2Fb/projects/p%2Fq/doctypes/d%3Fe/documents/s%23t')
  })

  it.each(['.', '..'])('refuses the org %j, which a URL parser would collapse', async (org) => {
    const f = fakeFetch({})
    await expect(client(f, { org }).projects.list()).rejects.toThrow(TypeError)
    expect(f).not.toHaveBeenCalled()
  })

  it.each(['', '.', '..'])('refuses %j, which a URL parser would turn into another route', async (slug) => {
    const f = fakeFetch({})
    const hv = client(f)
    expect(() => hv.project(slug)).toThrow(TypeError)
    expect(() => hv.project('p').documents(slug)).toThrow(TypeError)
    expect(() => hv.project('p').terms(slug)).toThrow(TypeError)
    await expect(hv.project('p').documents('post').update(slug, {})).rejects.toThrow(TypeError)
    await expect(hv.project('p').atoms.get(slug)).rejects.toThrow(TypeError)
    await expect(hv.project('p').settings.get(slug)).rejects.toThrow(TypeError)
    expect(f).not.toHaveBeenCalled()
  })
})

describe('project()', () => {
  const token = (projectSlug: string | null) => ({ token: { projectSlug }, org: { slug: 'acme' }, features: {} })

  it('implies the slug on a project-narrowed token, and looks it up once', async () => {
    const f = fakeFetch(token('narrow'), {}, {})
    const site = client(f).project()
    await site.settings.list()
    await site.atoms.list()
    expect(f.mock.calls.map(([url]) => url)).toEqual([
      'https://api.test/v1/token',
      'https://api.test/v1/orgs/acme/projects/narrow/settings',
      'https://api.test/v1/orgs/acme/projects/narrow/atoms'
    ])
  })

  it('shares one lookup between the org and the implied project', async () => {
    const f = fakeFetch(token('narrow'), {})
    await client(f, { org: undefined as never }).project().settings.list()
    expect(f).toHaveBeenCalledTimes(2)
    expect(f.mock.calls[1]![0]).toBe('https://api.test/v1/orgs/acme/projects/narrow/settings')
  })

  it('throws PROJECT_REQUIRED on an org-wide token, without listing projects', async () => {
    const f = fakeFetch(token(null))
    const err = await client(f).project().settings.list().catch((e: unknown) => e)
    expect(isHypervalentError(err) && err.code).toBe('PROJECT_REQUIRED')
    expect(f).toHaveBeenCalledOnce()
  })

  it('does not blame the token when the lookup answers no token at all', async () => {
    const err = await client(fakeFetch({})).project().settings.list().catch((e: unknown) => e)
    expect(isHypervalentError(err) && err.code).toBe('UNEXPECTED_RESPONSE')
  })

  it('makes no lookup when the slug is named, and leaves a mismatch for the API to refuse', async () => {
    const f = fakeFetch({})
    await client(f).project('other').settings.list()
    expect(f.mock.calls[0]![0]).toBe('https://api.test/v1/orgs/acme/projects/other/settings')
  })

  it('does not remember a failed lookup', async () => {
    const f = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ status: 401, code: 'INVALID_API_TOKEN', message: 'no' }, 401))
      .mockResolvedValueOnce(json(token('narrow')))
      .mockResolvedValueOnce(json({}))
    const site = client(f).project()
    await expect(site.settings.list()).rejects.toMatchObject({ code: 'INVALID_API_TOKEN' })
    await expect(site.settings.list()).resolves.toEqual({})
  })

  it('refuses a browser write before spending a request on the lookup', async () => {
    vi.stubGlobal('document', {})
    const f = fakeFetch(token('narrow'))
    await expect(client(f).project().documents('post').create({})).rejects.toMatchObject({ code: 'BROWSER_WRITE_UNSUPPORTED' })
    expect(f).not.toHaveBeenCalled()
  })
})

describe('whoami() and orgToken()', () => {
  it('read their own routes, afresh each time', async () => {
    const f = fakeFetch({ token: {} })
    const hv = client(f)
    await hv.whoami()
    await hv.whoami()
    await hv.orgToken()
    expect(f.mock.calls.map(([url]) => url)).toEqual([
      'https://api.test/v1/token',
      'https://api.test/v1/token',
      'https://api.test/v1/orgs/acme/token'
    ])
  })
})

describe('designTokens', () => {
  it('css() asks for and answers text', async () => {
    const f = vi.fn<typeof fetch>(async () => new Response(':root{}', { headers: { 'content-type': 'text/css' } }))
    expect(await client(f).project('p').designTokens.css()).toBe(':root{}')
    expect(new Headers(f.mock.calls[0]![1]!.headers).get('accept')).toBe('text/css')
  })

  it('css() answers an empty stylesheet as text, not null', async () => {
    const f = vi.fn<typeof fetch>(async () => new Response('', { headers: { 'content-type': 'text/css' } }))
    expect(await client(f).project('p').designTokens.css()).toBe('')
  })

  it('passes token_type as the API spells it', async () => {
    const f = fakeFetch({ results: [], count: 0 })
    await client(f).project('p').designTokens.list({ token_type: 'color', status: 'draft' })
    expect(urlOf(f).search).toBe('?token_type=color&status=draft')
  })
})

describe('library', () => {
  it('plan() sends kind:slug pairs, and insert() sends the items as a body', async () => {
    const f = fakeFetch({})
    const library = client(f).project('p').library
    await library.plan([{ kind: 'molecule', slug: 'hero' }, { kind: 'atom', slug: 'headline' }])
    expect(urlOf(f).searchParams.get('items')).toBe('molecule:hero,atom:headline')
    await library.insert([{ kind: 'atom', slug: 'headline' }])
    expect(JSON.parse(initOf(f, 1).body as string)).toEqual({ items: [{ kind: 'atom', slug: 'headline' }] })
  })
})

describe('media', () => {
  /** What AbortSignal.timeout was asked for. */
  const timeouts = () => vi.spyOn(AbortSignal, 'timeout')

  it('upload() sends multipart with one file, and answers { images, errors }', async () => {
    const answer = { images: [row('i')], errors: [] }
    const f = fakeFetch(answer)
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    expect(await client(f).project('p').media.upload(file, { title: 'T', alt: 'A' })).toEqual(answer)
    const form = initOf(f).body as FormData
    expect((form.getAll('files')[0] as File).name).toBe('a.png')
    expect(form.get('title')).toBe('T')
    expect(form.get('alt')).toBe('A')
    expect(new Headers(initOf(f).headers).has('content-type')).toBe(false)
  })

  it('upload() takes several files, and leaves out a title it was not given', async () => {
    const f = fakeFetch({ images: [], errors: [] })
    await client(f).project('p').media.upload([new Blob(['x']), new Blob(['y'])])
    const form = initOf(f).body as FormData
    expect(form.getAll('files')).toHaveLength(2)
    expect(form.has('title')).toBe(false)
  })

  it('uploadFromUrl() sends JSON, and answers { image }', async () => {
    const f = fakeFetch({ image: row('i') })
    expect(await client(f).project('p').media.uploadFromUrl('https://e.test/a.png', { alt: 'A' })).toEqual({ image: row('i') })
    expect(JSON.parse(initOf(f).body as string)).toEqual({ url: 'https://e.test/a.png', alt: 'A' })
    expect(new Headers(initOf(f).headers).get('content-type')).toBe('application/json')
  })

  it('both default to 60 seconds, and a call can override it', async () => {
    const spy = timeouts()
    const f = fakeFetch({})
    const { media } = client(f).project('p')
    await media.upload(new Blob(['x']))
    await media.uploadFromUrl('https://e.test/a.png')
    await media.uploadFromUrl('https://e.test/a.png', { timeoutMs: 5 })
    expect(spy.mock.calls.map(([ms]) => ms)).toEqual([60_000, 60_000, 5])
    spy.mockRestore()
  })

  /** A media list answer. `offset` follows the page, as the API's does. */
  const mediaPage = (rows: unknown[], page: number, count: number, limit = 2) => ({
    images: { results: rows, count, limit, offset: (page - 1) * limit, page }
  })

  it('list() makes one GET with the filters the spec names, and answers the envelope', async () => {
    const answer = mediaPage([row('a')], 1, 9)
    const f = fakeFetch(answer)
    expect(await client(f).project('p').media.list({ mediaType: 'image', search: 'hero', page: 2 })).toEqual(answer)
    expect(f).toHaveBeenCalledOnce()
    expect(initOf(f).method).toBe('GET')
    expect(urlOf(f).pathname).toBe('/v1/orgs/acme/projects/p/media')
    expect(urlOf(f).search).toBe('?mediaType=image&search=hero&page=2')
  })

  it('iterate() walks every page of .images, keeping the filters', async () => {
    const f = fakeFetch(mediaPage([row('a'), row('b')], 1, 3), mediaPage([row('c')], 2, 3))
    const rows = await collect(client(f).project('p').media.iterate({ limit: 2, mediaType: 'document' }))
    expect(rows.map(r => r.uuid)).toEqual(['a', 'b', 'c'])
    expect(f).toHaveBeenCalledTimes(2)
    for (const call of [0, 1]) {
      expect(urlOf(f, call).searchParams.get('mediaType')).toBe('document')
      expect(urlOf(f, call).searchParams.get('page')).toBe(String(call + 1))
    }
  })

  it('get() reads one item by its encoded uuid, and refuses an empty one before any request', async () => {
    const f = fakeFetch({ image: row('i') })
    const { media } = client(f).project('p')
    expect(await media.get('i/x')).toEqual({ image: row('i') })
    expect(urlOf(f).pathname).toBe('/v1/orgs/acme/projects/p/media/i%2Fx')
    await expect(media.get('')).rejects.toThrow(new TypeError('uuid must be a slug'))
    expect(f).toHaveBeenCalledOnce()
  })

  it('surfaces a read token\'s 403 TOKEN_SCOPE_READ_ONLY as a HypervalentError', async () => {
    const f = vi.fn<typeof fetch>(async () => json({ status: 403, code: 'TOKEN_SCOPE_READ_ONLY', message: 'No', requiredPlan: 'team' }, 403))
    const error = await client(f).project('p').media.get('i').catch((err: unknown) => err)
    expect(isHypervalentError(error) && [error.status, error.code]).toEqual([403, 'TOKEN_SCOPE_READ_ONLY'])
    expect(f).toHaveBeenCalledOnce()
  })

  it('types the media filters, and refuses the rest', () => {
    // Compile-time only (`npm run typecheck`): never called.
    const typed = (hv: ReturnType<typeof client>) => {
      const { media } = hv.project('p')
      void media.pages({ mediaType: 'video', search: 'x' })
      // @ts-expect-error not one of the media types
      void media.list({ mediaType: 'pdf' })
      // @ts-expect-error the media list has no sort
      void media.list({ sort: 'title' })
    }
    expect(typed).toBeTypeOf('function')
  })

  it('other calls keep the client timeout', async () => {
    const spy = timeouts()
    await client(fakeFetch({})).project('p').settings.list()
    expect(spy.mock.calls.map(([ms]) => ms)).toEqual([15_000])
    spy.mockRestore()
  })
})

describe('resolveFieldMedia', () => {
  const IMAGE = '00000000-0000-4000-8000-000000000001'
  const FILE = '00000000-0000-4000-8000-000000000002'
  const GONE = '00000000-0000-4000-8000-000000000003'
  const read = {
    referencedImages: [{ uuid: IMAGE, cdnUrl: 'i' }],
    referencedFiles: [{ uuid: FILE, title: null, url: 'f', filename: 'f.pdf', mime: 'application/pdf', size: 1 }]
  } as never

  it('resolves by the field\'s type, not the asset\'s', () => {
    expect(resolveFieldMedia(read, 'image', [IMAGE, FILE]).map(m => m.uuid)).toEqual([IMAGE])
    expect(resolveFieldMedia(read, 'file', [IMAGE, FILE])).toEqual([expect.objectContaining({ uuid: FILE })])
  })

  it('returns a video field\'s external URL as given, in the value\'s order', () => {
    expect(resolveFieldMedia(read, 'video', ['https://youtu.be/x', FILE])).toEqual(['https://youtu.be/x', expect.objectContaining({ uuid: FILE })])
  })

  it('takes a single value, and leaves out what it cannot resolve', () => {
    expect(resolveFieldMedia(read, 'image', IMAGE)).toHaveLength(1)
    expect(resolveFieldMedia(read, 'image', 'not-a-uuid')).toEqual([])
    expect(resolveFieldMedia(read, 'file', GONE)).toEqual([])
    expect(resolveFieldMedia(read, 'file', null)).toEqual([])
    expect(resolveFieldMedia(read, 'file', ['', 7, {}])).toEqual([])
  })

  it('matches a uuid regardless of its case', () => {
    expect(resolveFieldMedia(read, 'image', IMAGE.toUpperCase())).toHaveLength(1)
  })

  it('refuses a field type that holds no media', () => {
    expect(() => resolveFieldMedia(read, 'text' as never, 'x')).toThrow(TypeError)
  })
})
