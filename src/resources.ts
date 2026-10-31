import type { components, operations } from './generated/openapi'

import { HypervalentError } from './errors'
import { assertWriteAllowed, type HttpMethod, type HypervalentResponse, type QueryValue, type SendOptions } from './transport'

type Schemas = components['schemas']
type Answer<Op extends keyof operations> = operations[Op] extends { responses: { 200: { content: { 'application/json': infer T } } } } ? T : never
type Query<Op extends keyof operations> = NonNullable<operations[Op]['parameters']['query']>

/** Taken by every method. */
export interface CallOptions {
  signal?: AbortSignal
  /** Per attempt. Overrides the client's `timeoutMs`. */
  timeoutMs?: number
}

type ReadOptions<Op extends keyof operations> = Query<Op> & CallOptions

/** `pages()` and `iterate()` choose the page themselves. `limit` defaults to the server's maximum, 50. */
type WalkOptions<Op extends keyof operations> = Omit<Query<Op>, 'page' | 'offset'> & CallOptions

interface Paged<Op extends keyof operations, Row> {
  /** One page, in the API's envelope. Always exactly one request. */
  list(options?: ReadOptions<Op>): Promise<Answer<Op>>
  /** Each page's envelope, which is where `referencedImages` and `referencedFiles` ship. */
  pages(options?: WalkOptions<Op>): AsyncGenerator<Answer<Op>, void>
  /**
   * Every row, one request per page. Offset paging is not a snapshot: repeats from
   * a row inserted mid-walk are removed, but a row can still be skipped.
   */
  iterate(options?: WalkOptions<Op>): AsyncGenerator<Row, void>
}

interface PageInfo<Row> {
  results: Row[]
  count: number
  offset: number
}

export interface DocumentsResource extends Paged<'listDocuments', Schemas['ListedDocument']> {
  get(slug: string, options?: ReadOptions<'getDocument'>): Promise<Answer<'getDocument'>>
  /** A timed-out create may have landed. Supply a `slug` if you re-run: a repeat is then a 409 `SLUG_CONFLICT`. */
  create(body: Schemas['DocumentWrite'], options?: CallOptions): Promise<Answer<'createDocument'>>
  update(slug: string, body: Schemas['DocumentWrite'], options?: CallOptions): Promise<Answer<'updateDocument'>>
  publish(slug: string, options?: CallOptions): Promise<Answer<'publishDocument'>>
  unpublish(slug: string, options?: CallOptions): Promise<Answer<'unpublishDocument'>>
  trash(slug: string, options?: CallOptions): Promise<Answer<'trashDocument'>>
}

export interface TermsResource extends Paged<'getTaxonomy', Schemas['ListedTerm']> {
  get(slug: string, options?: ReadOptions<'getTerm'>): Promise<Answer<'getTerm'>>
  /** A timed-out create may have landed. Supply a `slug` if you re-run: a repeat is then a 409 `SLUG_CONFLICT`. */
  create(body: Schemas['TermWrite'], options?: CallOptions): Promise<Answer<'createTerm'>>
  update(slug: string, body: Schemas['TermWrite'], options?: CallOptions): Promise<Answer<'updateTerm'>>
  publish(slug: string, options?: CallOptions): Promise<Answer<'publishTerm'>>
  unpublish(slug: string, options?: CallOptions): Promise<Answer<'unpublishTerm'>>
  trash(slug: string, options?: CallOptions): Promise<Answer<'trashTerm'>>
}

export interface UploadOptions extends CallOptions {
  title?: string
  alt?: string
}

/** The upload route's answer to a multipart body. */
export type MediaUploaded = Required<Pick<Schemas['MediaUploadResult'], 'images' | 'errors'>>

export interface ProjectResources {
  documents(doctype: string): DocumentsResource
  terms(taxonomy: string): TermsResource
  doctypes: {
    list(options?: ReadOptions<'listDocumentTypes'>): Promise<Answer<'listDocumentTypes'>>
    get(slug: string, options?: ReadOptions<'getDocumentType'>): Promise<Answer<'getDocumentType'>>
    create(body: Schemas['DocumentTypeWrite'], options?: CallOptions): Promise<Answer<'createDocumentType'>>
    update(slug: string, body: Schemas['DocumentTypeWrite'], options?: CallOptions): Promise<Answer<'updateDocumentType'>>
  }
  taxonomies: {
    list(options?: ReadOptions<'listTaxonomies'>): Promise<Answer<'listTaxonomies'>>
    get(slug: string, options?: ReadOptions<'getTaxonomy'>): Promise<Answer<'getTaxonomy'>>
    create(body: Schemas['TaxonomyWrite'], options?: CallOptions): Promise<Answer<'createTaxonomy'>>
    update(slug: string, body: Schemas['TaxonomyWrite'], options?: CallOptions): Promise<Answer<'updateTaxonomy'>>
  }
  atoms: {
    list(options?: ReadOptions<'listAtoms'>): Promise<Answer<'listAtoms'>>
    get(slug: string, options?: ReadOptions<'getAtom'>): Promise<Answer<'getAtom'>>
    create(body: Schemas['AtomWrite'], options?: CallOptions): Promise<Answer<'createAtom'>>
    update(slug: string, body: Schemas['AtomWrite'], options?: CallOptions): Promise<Answer<'updateAtom'>>
  }
  molecules: {
    list(options?: ReadOptions<'listMolecules'>): Promise<Answer<'listMolecules'>>
    get(slug: string, options?: ReadOptions<'getMolecule'>): Promise<Answer<'getMolecule'>>
    create(body: Schemas['MoleculeWrite'], options?: CallOptions): Promise<Answer<'createMolecule'>>
    update(slug: string, body: Schemas['MoleculeWrite'], options?: CallOptions): Promise<Answer<'updateMolecule'>>
  }
  settings: {
    list(options?: CallOptions): Promise<Answer<'listSettings'>>
    get(slug: string, options?: CallOptions): Promise<Answer<'getSetting'>>
  }
  designTokens: {
    list(options?: ReadOptions<'listDesignTokens'>): Promise<Answer<'listDesignTokens'>>
    update(body: Schemas['DesignTokenEdits'], options?: CallOptions): Promise<Answer<'updateDesignTokens'>>
    schemes(options?: ReadOptions<'listDesignTokenSchemes'>): Promise<Answer<'listDesignTokenSchemes'>>
    theme(options?: CallOptions): Promise<Answer<'getDesignTheme'>>
    updateTheme(body: Schemas['DesignThemeWrite'], options?: CallOptions): Promise<Answer<'updateDesignTheme'>>
    /** The stylesheet, as text. */
    css(options?: CallOptions): Promise<string>
    w3c(options?: CallOptions): Promise<Answer<'getDesignTokensW3C'>>
  }
  library: {
    list(options?: CallOptions): Promise<Answer<'listLibrary'>>
    /** A dry run of `insert`. Writes nothing. */
    plan(items: readonly Schemas['LibraryItemRef'][], options?: CallOptions): Promise<Answer<'planLibraryInsert'>>
    insert(items: readonly Schemas['LibraryItemRef'][], options?: CallOptions): Promise<Answer<'insertLibraryItems'>>
  }
  media: {
    /** Multipart. `timeoutMs` defaults to 60000. A plain Blob has no file name, so pass a File to keep one. */
    upload(files: Blob | readonly Blob[], options?: UploadOptions): Promise<MediaUploaded>
    /** The server fetches `url`. `timeoutMs` defaults to 60000. */
    uploadFromUrl(url: string, options?: UploadOptions): Promise<Required<Pick<Schemas['MediaUploadResult'], 'image'>>>
  }
}

export interface ClientResources {
  /** `GET /v1/token`: the token, its organization and its public features. Read afresh on each call. */
  whoami(options?: CallOptions): Promise<Answer<'getTokenOrgless'>>
  /** `GET /v1/orgs/:org/token`: `whoami` without the organization, which the path already names. */
  orgToken(options?: CallOptions): Promise<Answer<'getToken'>>
  projects: Paged<'listProjects', Schemas['Project']>
  /** Omit the slug on a project-narrowed token. On any other token the first call then throws `PROJECT_REQUIRED`. */
  project(slug?: string): ProjectResources
}

type RequestFn = <T>(method: HttpMethod, path: string, options?: SendOptions & { orgless?: boolean }) => Promise<HypervalentResponse<T>>
type ProjectSlugFn = (signal?: AbortSignal) => Promise<string>

const MEDIA_TIMEOUT_MS = 60_000
const MAX_PAGE_SIZE = 50

/**
 * Encodes one path segment. A URL parser collapses `.` and `..` even when
 * percent-encoded, and an empty slug drops its segment, so each would reach
 * another route: `update('..')` would POST to the create route.
 */
export function segment(name: string, value: unknown): string {
  if (typeof value !== 'string' || value === '' || value === '.' || value === '..') {
    throw new TypeError(`${name} must be a slug`)
  }
  return encodeURIComponent(value)
}

type Extra = Pick<SendOptions, 'body' | 'accept'> & { orgless?: boolean }

/** Splits a method's options into the transport's and the query, and answers the body. */
async function send<T>(request: RequestFn, method: HttpMethod, path: string, options: CallOptions = {}, extra: Extra = {}): Promise<T> {
  const { signal, timeoutMs, ...query } = options
  const transport: SendOptions & Extra = { ...extra, query: query as Record<string, QueryValue> }
  if (signal) transport.signal = signal
  if (timeoutMs !== undefined) transport.timeoutMs = timeoutMs
  return (await request<T>(method, path, transport)).body
}

function paged<Op extends keyof operations, Row extends { uuid: string }>(
  read: (options?: ReadOptions<Op>) => Promise<Answer<Op>>,
  info: (page: Answer<Op>) => PageInfo<Row>
): Paged<Op, Row> {
  async function* pages(options: WalkOptions<Op> = {} as WalkOptions<Op>) {
    let previousOffset = -1
    for (let page = 1; ; page++) {
      const query = { limit: MAX_PAGE_SIZE, ...options, page } as WalkOptions<Op> & { limit?: number, page: number, offset?: number }
      query.limit ??= MAX_PAGE_SIZE
      // For callers without types: the walk drives `page`, and the spec says `page` loses to an `offset`.
      delete query.offset
      const answer = await read(query as unknown as ReadOptions<Op>)
      const { results, count, offset } = info(answer)
      // An answer that does not move forward would repeat this page forever.
      if (offset <= previousOffset) {
        throw new HypervalentError({ status: 200, code: 'UNEXPECTED_RESPONSE', message: `Page ${page} of a list did not advance past offset ${previousOffset}` })
      }
      previousOffset = offset
      yield answer
      if (results.length === 0 || offset + results.length >= count) return
    }
  }
  return {
    list: read,
    pages,
    async* iterate(options) {
      const seen = new Set<string>()
      for await (const answer of pages(options)) {
        for (const row of info(answer).results) {
          if (seen.has(row.uuid)) continue
          seen.add(row.uuid)
          yield row
        }
      }
    }
  }
}

function projectResources(request: RequestFn, projectSlug: ProjectSlugFn): ProjectResources {
  /** Under `/projects/:slug`. A refused write is refused first, so it spends no request on the slug lookup. */
  async function call<T>(method: HttpMethod, path: () => string, options?: CallOptions, extra?: Extra): Promise<T> {
    assertWriteAllowed(method)
    const rest = path()
    return send<T>(request, method, `/projects/${segment('project', await projectSlug(options?.signal))}${rest}`, options, extra)
  }
  const get = <T>(path: () => string, options?: CallOptions) => call<T>('GET', path, options)
  const post = <T>(path: () => string, body?: unknown, options?: CallOptions) =>
    call<T>('POST', path, options, { body })

  /** The list, get, create and update every structure resource shares. */
  function structure<List, One, Created, Updated, Write>(base: string) {
    const item = (slug: string) => () => `${base}/${segment('slug', slug)}`
    return {
      list: (options?: CallOptions) => get<List>(() => base, options),
      get: (slug: string, options?: CallOptions) => get<One>(item(slug), options),
      create: (body: Write, options?: CallOptions) => post<Created>(() => base, body, options),
      update: (slug: string, body: Write, options?: CallOptions) => post<Updated>(item(slug), body, options)
    }
  }

  /** The reads and writes documents and terms share, under the collection `base` names. */
  function content(base: string) {
    const { get, create, update } = structure<never, unknown, unknown, unknown, unknown>(base)
    const action = (name: string) => (slug: string, options?: CallOptions) =>
      post(() => `${base}/${segment('slug', slug)}/${name}`, undefined, options)
    return { get, create, update, publish: action('publish'), unpublish: action('unpublish'), trash: action('trash') }
  }

  const mediaOptions = (options: UploadOptions) => ({ ...options, timeoutMs: options.timeoutMs ?? MEDIA_TIMEOUT_MS })

  return {
    documents(doctype) {
      const base = `/doctypes/${segment('doctype', doctype)}/documents`
      return {
        ...paged<'listDocuments', Schemas['ListedDocument']>(options => get(() => base, options), page => page.documents),
        ...content(base)
      } as DocumentsResource
    },
    terms(taxonomy) {
      const parent = `/taxonomies/${segment('taxonomy', taxonomy)}`
      return {
        ...paged<'getTaxonomy', Schemas['ListedTerm']>(options => get(() => parent, options), page => page.terms),
        ...content(`${parent}/terms`)
      } as TermsResource
    },
    doctypes: structure<Answer<'listDocumentTypes'>, Answer<'getDocumentType'>, Answer<'createDocumentType'>, Answer<'updateDocumentType'>, Schemas['DocumentTypeWrite']>('/doctypes'),
    taxonomies: structure<Answer<'listTaxonomies'>, Answer<'getTaxonomy'>, Answer<'createTaxonomy'>, Answer<'updateTaxonomy'>, Schemas['TaxonomyWrite']>('/taxonomies'),
    atoms: structure<Answer<'listAtoms'>, Answer<'getAtom'>, Answer<'createAtom'>, Answer<'updateAtom'>, Schemas['AtomWrite']>('/atoms'),
    molecules: structure<Answer<'listMolecules'>, Answer<'getMolecule'>, Answer<'createMolecule'>, Answer<'updateMolecule'>, Schemas['MoleculeWrite']>('/molecules'),
    settings: {
      list: options => get(() => '/settings', options),
      get: (slug, options) => get(() => `/settings/${segment('slug', slug)}`, options)
    },
    designTokens: {
      list: options => get(() => '/design-tokens', options),
      update: (body, options) => post(() => '/design-tokens', body, options),
      schemes: options => get(() => '/design-token-schemes', options),
      theme: options => get(() => '/design-token-theme', options),
      updateTheme: (body, options) => post(() => '/design-token-theme', body, options),
      // The transport answers an empty body as null.
      css: async options => (await call<string | null>('GET', () => '/design-tokens.css', options, { accept: 'text/css' })) ?? '',
      w3c: options => get(() => '/design-tokens.tokens.json', options)
    },
    library: {
      list: options => get(() => '/library', options),
      plan: (items, options) => get(() => '/library/plan', { ...options, items: items.map(({ kind, slug }) => `${kind}:${slug}`).join(',') } as CallOptions),
      insert: (items, options) => post(() => '/library/insert', { items }, options)
    },
    media: {
      upload(files, { title, alt, ...options } = {}) {
        const form = new FormData()
        const list: readonly Blob[] = Array.isArray(files) ? files : [files as Blob]
        for (const file of list) form.append('files', file)
        if (title !== undefined) form.set('title', title)
        if (alt !== undefined) form.set('alt', alt)
        return post(() => '/media', form, mediaOptions(options))
      },
      uploadFromUrl(url, { title, alt, ...options } = {}) {
        return post(() => '/media', { url, title, alt }, mediaOptions(options))
      }
    }
  }
}

export function clientResources(request: RequestFn, tokenProjectSlug: ProjectSlugFn): ClientResources {
  return {
    whoami: options => send(request, 'GET', '/token', options, { orgless: true }),
    orgToken: options => send(request, 'GET', '/token', options),
    projects: paged<'listProjects', Schemas['Project']>(
      options => send(request, 'GET', '/projects', options),
      page => page
    ),
    project(slug) {
      if (slug === undefined) return projectResources(request, tokenProjectSlug)
      segment('project', slug)
      return projectResources(request, () => Promise.resolve(slug))
    }
  }
}
