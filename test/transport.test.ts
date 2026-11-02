import { createServer, type Server } from 'node:http'
import { inspect } from 'node:util'

import type { AddressInfo } from 'node:net'

import { type ClientOptions, createClient, HypervalentError, isHypervalentError } from '../src'
import { parseRetryAfter } from '../src/errors'

import { afterEach, describe, expect, it, vi } from 'vitest'

const TOKEN = 'atk_0123456789abcdefSECRET'

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })

const networkFailure = () => Promise.reject(new TypeError('fetch failed'))

/** Answers each call from a list. The last entry repeats. */
function fakeFetch(...answers: (() => Response | Promise<Response>)[]) {
  let call = 0
  return vi.fn<typeof fetch>(async () => {
    const answer = answers[Math.min(call++, answers.length - 1)]!
    return answer()
  })
}

/** Never answers until its signal fires, as a real fetch does. */
const hangingFetch = () => vi.fn<typeof fetch>((_url, init) => new Promise((_resolve, reject) => {
  init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason))
}))

const client = (fetchImpl: typeof fetch, options: Partial<ClientOptions> = {}) =>
  createClient({ token: TOKEN, org: 'acme', baseUrl: 'https://api.test', fetch: fetchImpl, ...options })

const failure = async (promise: Promise<unknown>): Promise<HypervalentError> => {
  const err = await promise.then(() => null, (e: unknown) => e)
  if (!isHypervalentError(err)) throw new Error(`expected a HypervalentError, got ${String(err)}`)
  return err
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('request', () => {
  it('sends the token and resolves paths under the org', async () => {
    const f = fakeFetch(() => json(200, { ok: true }))
    const res = await client(f, { baseUrl: 'https://api.test/' }).request('GET', '/projects', { query: { limit: 5, page: undefined, draft: null } })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
    const [url, init] = f.mock.calls[0]!
    expect(url).toBe('https://api.test/v1/orgs/acme/projects?limit=5')
    const headers = new Headers(init!.headers)
    expect(headers.get('authorization')).toBe(`Bearer ${TOKEN}`)
    expect(headers.get('accept')).toBe('application/json')
    expect(headers.has('content-type')).toBe(false)
  })

  it('takes headers and accept, and a caller header cannot replace the token', async () => {
    const f = fakeFetch(() => new Response('body{}', { headers: { 'content-type': 'text/css' } }))
    const res = await client(f).request('GET', '/tokens.css', {
      accept: 'text/css',
      headers: { 'If-None-Match': '"a"', 'Authorization': 'Bearer other' }
    })
    expect(res.body).toBe('body{}')
    const headers = new Headers(f.mock.calls[0]![1]!.headers)
    expect(headers.get('accept')).toBe('text/css')
    expect(headers.get('if-none-match')).toBe('"a"')
    expect(headers.get('authorization')).toBe(`Bearer ${TOKEN}`)
  })

  it('encodes a JSON body and passes FormData untouched', async () => {
    const f = fakeFetch(() => json(201, {}))
    const hv = client(f)
    await hv.request('POST', '/a', { body: { title: 'Hi' } })
    const jsonInit = f.mock.calls[0]![1]!
    expect(jsonInit.body).toBe('{"title":"Hi"}')
    expect(new Headers(jsonInit.headers).get('content-type')).toBe('application/json')

    const form = new FormData()
    await hv.request('POST', '/b', { body: form, headers: { 'Content-Type': 'application/json' } })
    const formInit = f.mock.calls[1]![1]!
    expect(formInit.body).toBe(form)
    expect(new Headers(formInit.headers).has('content-type')).toBe(false)
  })

  it('answers null for an empty body and treats a 304 as an answer', async () => {
    const f = fakeFetch(() => new Response(null, { status: 304, headers: { etag: '"a"' } }))
    const res = await client(f).request('GET', '/x', { headers: { 'If-None-Match': '"a"' } })
    expect(res.status).toBe(304)
    expect(res.body).toBeNull()
    expect(res.headers.get('etag')).toBe('"a"')
  })

  it('refuses a 2xx whose JSON does not parse, without retrying', async () => {
    const f = fakeFetch(() => new Response('<html>', { headers: { 'content-type': 'application/json' } }))
    const err = await failure(client(f).request('GET', '/x'))
    expect(err).toMatchObject({ status: 200, code: 'UNEXPECTED_RESPONSE' })
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('requires a token and sane options', () => {
    expect(() => createClient({ token: '' })).toThrow(TypeError)
    expect(() => client(fakeFetch(), { timeoutMs: 0 })).toThrow(TypeError)
    expect(() => client(fakeFetch(), { maxRetries: -1 })).toThrow(TypeError)
    expect(() => client(fakeFetch(), { maxRetryDelayMs: Infinity })).toThrow(TypeError)
    expect(() => client(fakeFetch(), { maxRetries: 1.5 })).toThrow(TypeError)
    expect(() => client(fakeFetch(), { baseUrl: 'api.test' })).toThrow(TypeError)
  })

  it('refuses a per-call timeout no timer can hold, sending nothing', async () => {
    const f = fakeFetch(() => json(200, {}))
    for (const timeoutMs of [0, -1, 2 ** 31, Number.NaN]) {
      await expect(client(f).request('GET', '/x', { timeoutMs })).rejects.toThrow(TypeError)
    }
    expect(f).not.toHaveBeenCalled()
  })

  it('refuses a body on a read rather than reporting a network error', async () => {
    const f = fakeFetch(() => json(200, {}))
    await expect(client(f).request('GET', '/x', { body: {} })).rejects.toThrow(TypeError)
    expect(f).not.toHaveBeenCalled()
  })

  it('refuses a path that climbs out of its base', async () => {
    const f = fakeFetch(() => json(200, {}))
    await expect(client(f).request('GET', '/x/../../../token')).rejects.toThrow(TypeError)
    await expect(client(f).request('GET', '/%2e%2e/%2e%2e', { orgless: true })).rejects.toThrow(TypeError)
    expect(f).not.toHaveBeenCalled()
    await client(f).request('GET', '/a/../b')
    expect(f.mock.calls[0]![0]).toBe('https://api.test/v1/orgs/acme/b')
  })

  it('leaves absent extras off the error', () => {
    expect(Object.keys(new HypervalentError({ status: 0, code: 'ABORTED', message: 'x' })).sort()).toEqual(['code', 'name', 'status'])
  })

  it('hands back a schema typegen did not generate, with no other effect', async () => {
    const f = fakeFetch(() => json(200, {}))
    const hv = createClient({ token: TOKEN, org: 'acme', fetch: f, schema: { version: 1 } })
    const version: number | undefined = hv.schema?.version
    expect(version).toBe(1)
    await hv.request('GET', '/x')
    expect(f).toHaveBeenCalledTimes(1)
  })
})

describe('org resolution', () => {
  const whoami = () => json(200, { token: {}, org: { uuid: 'u', slug: 'a b', title: 'T' }, features: {} })

  it('reads the org once, even for concurrent calls, and encodes it', async () => {
    const f = fakeFetch(whoami, () => json(200, {}))
    const noOrg = createClient({ token: TOKEN, baseUrl: 'https://api.test', fetch: f })
    await Promise.all([noOrg.request('GET', '/a'), noOrg.request('GET', '/b')])
    await noOrg.request('GET', '/c')
    const urls = f.mock.calls.map(([url]) => String(url))
    expect(urls.filter(url => url === 'https://api.test/v1/token')).toHaveLength(1)
    expect(urls).toContain('https://api.test/v1/orgs/a%20b/c')
  })

  it('does not read the org when it is given, or for an orgless call', async () => {
    const f = fakeFetch(() => json(200, {}))
    await client(f).request('GET', '/a')
    await createClient({ token: TOKEN, baseUrl: 'https://api.test', fetch: f }).request('GET', '/token', { orgless: true })
    expect(f.mock.calls.map(([url]) => url)).toEqual(['https://api.test/v1/orgs/acme/a', 'https://api.test/v1/token'])
  })

  it('does not remember a failure', async () => {
    const f = fakeFetch(() => json(401, { error: { code: 'INVALID_API_TOKEN', message: 'no' } }), whoami, () => json(200, {}))
    const hv = createClient({ token: TOKEN, baseUrl: 'https://api.test', fetch: f })
    expect((await failure(hv.request('GET', '/a'))).code).toBe('INVALID_API_TOKEN')
    expect((await hv.request('GET', '/a')).status).toBe(200)
  })

  it('fails clearly when the whoami names no org', async () => {
    const f = fakeFetch(() => json(200, { org: { slug: null } }))
    const hv = createClient({ token: TOKEN, baseUrl: 'https://api.test', fetch: f })
    expect(await failure(hv.request('GET', '/a'))).toMatchObject({ status: 200, code: 'UNEXPECTED_RESPONSE' })
  })

  it('one caller aborting does not fail another waiting on the same lookup', async () => {
    let answer!: (r: Response) => void
    const f = fakeFetch(() => new Promise<Response>((resolve) => {
      answer = resolve
    }), () => json(200, {}))
    const hv = createClient({ token: TOKEN, baseUrl: 'https://api.test', fetch: f })
    const controller = new AbortController()
    const first = hv.request('GET', '/a', { signal: controller.signal })
    const second = hv.request('GET', '/b')
    controller.abort()
    expect((await failure(first)).code).toBe('ABORTED')
    answer(whoami())
    expect((await second).status).toBe(200)
  })
})

describe('HypervalentError', () => {
  it('reads the flat envelope and keeps its extras', async () => {
    const f = fakeFetch(() => json(409, {
      status: 409,
      code: 'VERSION_LOCKED',
      message: 'Locked',
      holder: { name: 'Ada' },
      expiresAt: '2026-10-30T12:00:00Z',
      max: 3
    }))
    const err = await failure(client(f).request('POST', '/x'))
    expect(err).toBeInstanceOf(HypervalentError)
    expect(err).toMatchObject({ status: 409, code: 'VERSION_LOCKED', message: 'Locked', holder: { name: 'Ada' }, expiresAt: '2026-10-30T12:00:00Z' })
    expect(err.details?.max).toBe(3)
  })

  it('reads the nested envelope the same way', async () => {
    const f = fakeFetch(() => json(403, {
      error: { status: 403, code: 'FEATURE_DISABLED', message: 'No', feature: 'apiTokensWrite', requiredPlan: 'team', upgrade: true }
    }))
    expect(await failure(client(f).request('POST', '/x'))).toMatchObject({
      status: 403, code: 'FEATURE_DISABLED', message: 'No', feature: 'apiTokensWrite', requiredPlan: 'team', upgrade: true
    })
  })

  it('keeps fields and issues', async () => {
    const f = fakeFetch(() => json(422, {
      code: 'VALIDATION_ERROR', message: 'Bad', fields: { title: 'Missing' }, issues: [{ path: 'atoms[0]', message: 'Bad' }]
    }))
    expect(await failure(client(f).request('POST', '/x'))).toMatchObject({
      fields: { title: 'Missing' }, issues: [{ path: 'atoms[0]', message: 'Bad' }]
    })
  })

  it('takes the status from the response, not the body', async () => {
    const f = fakeFetch(() => json(404, { status: 200, code: 'NOT_FOUND', message: 'No' }))
    expect((await failure(client(f).request('GET', '/x'))).status).toBe(404)
  })

  it.each([
    ['an HTML page', '<html>Bad gateway</html>', 'text/html'],
    ['JSON that is not an envelope', '{"message":"nope"}', 'application/json'],
    ['a JSON array', '[1]', 'application/json'],
    ['nothing', '', 'text/plain']
  ])('answers UNEXPECTED_RESPONSE for %s', async (_name, body, type) => {
    const f = fakeFetch(() => new Response(body, { status: 403, headers: { 'content-type': type } }))
    expect(await failure(client(f).request('GET', '/x'))).toMatchObject({ status: 403, code: 'UNEXPECTED_RESPONSE' })
  })

  it('makes any 429 RATE_LIMITED, with or without our envelope', async () => {
    const edge = fakeFetch(() => new Response('<html>slow down</html>', { status: 429, headers: { 'content-type': 'text/html' } }))
    expect(await failure(client(edge, { maxRetries: 0 }).request('GET', '/x'))).toMatchObject({ status: 429, code: 'RATE_LIMITED' })
    const api = fakeFetch(() => json(429, { code: 'SOMETHING_ELSE', message: 'Slow down' }, { 'retry-after': '7' }))
    expect(await failure(client(api, { maxRetries: 0 }).request('GET', '/x'))).toMatchObject({
      code: 'RATE_LIMITED', message: 'Slow down', retryAfterSeconds: 7
    })
  })

  it('keeps a new API code, and retryAfterSeconds on a 503', async () => {
    const f = fakeFetch(() => json(503, { code: 'PLATFORM_READ_ONLY', message: 'Paused' }, { 'retry-after': '60' }))
    expect(await failure(client(f, { maxRetries: 0 }).request('POST', '/x'))).toMatchObject({ code: 'PLATFORM_READ_ONLY', retryAfterSeconds: 60 })
  })

  it('isHypervalentError holds without the class identity, and refuses lookalikes', () => {
    const err = new HypervalentError({ status: 0, code: 'ABORTED', message: 'x' })
    expect(isHypervalentError(err)).toBe(true)
    expect(isHypervalentError(new Error('x'))).toBe(false)
    expect(isHypervalentError({ code: 'ABORTED', name: 'HypervalentError' })).toBe(false)
    expect(isHypervalentError(null)).toBe(false)
    expect(JSON.parse(JSON.stringify(err))).toEqual({ name: 'HypervalentError', status: 0, code: 'ABORTED', message: 'x' })
  })
})

describe('parseRetryAfter', () => {
  const now = Date.parse('2026-10-30T12:00:00Z')

  it('reads seconds', () => {
    expect(parseRetryAfter('120', now)).toBe(120)
    expect(parseRetryAfter(' 0 ', now)).toBe(0)
  })

  it('reads an HTTP date, rounding up, and a past date is no wait', () => {
    expect(parseRetryAfter('Fri, 30 Oct 2026 12:00:30 GMT', now)).toBe(30)
    expect(parseRetryAfter('Fri, 30 Oct 2026 11:00:00 GMT', now)).toBe(0)
  })

  it.each(['', '-5', '1.5', 'soon', null])('ignores %j', (value) => {
    expect(parseRetryAfter(value, now)).toBeNull()
  })
})

describe('retries: a read', () => {
  it.each([429, 502, 503, 504])('retries a GET on %i', async (status) => {
    const f = fakeFetch(() => json(status, { code: 'X', message: 'x' }, { 'retry-after': '0' }), () => json(200, {}))
    expect((await client(f).request('GET', '/x')).status).toBe(200)
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('retries a HEAD, whatever the case of the method', async () => {
    const f = fakeFetch(() => new Response(null, { status: 503, headers: { 'retry-after': '0' } }), () => new Response(null))
    expect((await client(f).request('head' as 'HEAD', '/x')).status).toBe(200)
    expect(f).toHaveBeenCalledTimes(2)
  })

  it.each([400, 401, 403, 404, 409, 422, 500])('does not retry a GET on %i', async (status) => {
    const f = fakeFetch(() => json(status, { code: 'X', message: 'x' }))
    expect((await failure(client(f).request('GET', '/x'))).status).toBe(status)
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('retries a GET after a network error', async () => {
    const f = fakeFetch(networkFailure, () => json(200, {}))
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect((await client(f, { maxRetryDelayMs: 1 }).request('GET', '/x')).status).toBe(200)
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('names a network failure whose cause has a non-string code', async () => {
    const f = vi.fn<typeof fetch>(async () => {
      throw Object.assign(new TypeError('fetch failed'), { cause: { code: -111, message: 'refused' } })
    })
    expect((await failure(client(f, { maxRetries: 0 }).request('GET', '/x'))).message).toContain('refused')
  })

  it('retries a GET after a timeout, then reports TIMEOUT', async () => {
    const f = hangingFetch()
    const err = await failure(client(f, { timeoutMs: 5, maxRetries: 1, maxRetryDelayMs: 1 }).request('GET', '/x'))
    expect(err).toMatchObject({ status: 0, code: 'TIMEOUT' })
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('stops at maxRetries, and 0 turns retries off', async () => {
    const answer = () => json(503, { code: 'X', message: 'x' }, { 'retry-after': '0' })
    const f = fakeFetch(answer)
    await failure(client(f).request('GET', '/x'))
    expect(f).toHaveBeenCalledTimes(3)
    const off = fakeFetch(answer)
    await failure(client(off, { maxRetries: 0 }).request('GET', '/x'))
    expect(off).toHaveBeenCalledTimes(1)
  })
})

describe('retries: a write', () => {
  it('is not retried after a timeout', async () => {
    const f = hangingFetch()
    expect((await failure(client(f, { timeoutMs: 5 }).request('POST', '/x', { body: {} }))).code).toBe('TIMEOUT')
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('is not retried after a network error', async () => {
    const f = fakeFetch(networkFailure)
    expect((await failure(client(f).request('POST', '/x', { body: {} }))).code).toBe('NETWORK_ERROR')
    expect(f).toHaveBeenCalledTimes(1)
  })

  it.each([500, 502, 503, 504])('is not retried after a %i', async (status) => {
    const f = fakeFetch(() => json(status, { code: 'X', message: 'x' }, { 'retry-after': '0' }))
    expect((await failure(client(f).request('POST', '/x', { body: {} }))).status).toBe(status)
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('is retried on a 429, with the same body', async () => {
    const f = fakeFetch(() => json(429, { code: 'RATE_LIMITED', message: 'x' }, { 'retry-after': '0' }), () => json(201, {}))
    expect((await client(f).request('POST', '/x', { body: { a: 1 } })).status).toBe(201)
    expect(f.mock.calls.map(([, init]) => init!.body)).toEqual(['{"a":1}', '{"a":1}'])
  })

  it('is not retried when the body stalls after the headers', async () => {
    const f = vi.fn<typeof fetch>(async (_url, init) => {
      const stream = new ReadableStream({
        start(controller) {
          init!.signal!.addEventListener('abort', () => controller.error(init!.signal!.reason))
        }
      })
      return new Response(stream, { status: 201 })
    })
    expect((await failure(client(f, { timeoutMs: 5 }).request('POST', '/x', { body: {} }))).code).toBe('TIMEOUT')
    expect(f).toHaveBeenCalledTimes(1)
  })
})

describe('retries: the wait', () => {
  const rateLimited = (retryAfter?: string) => () =>
    json(429, { code: 'RATE_LIMITED', message: 'x' }, retryAfter === undefined ? {} : { 'retry-after': retryAfter })

  it('waits the Retry-After seconds', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const f = fakeFetch(rateLimited('10'), () => json(200, {}))
    const pending = client(f).request('GET', '/x')
    await vi.advanceTimersByTimeAsync(9_999)
    expect(f).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect((await pending).status).toBe(200)
  })

  it('waits until a Retry-After date', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], now: Date.parse('2026-10-30T12:00:00Z') })
    const f = fakeFetch(rateLimited('Fri, 30 Oct 2026 12:00:05 GMT'), () => json(200, {}))
    const pending = client(f).request('POST', '/x')
    await vi.advanceTimersByTimeAsync(4_999)
    expect(f).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect((await pending).status).toBe(200)
  })

  it('throws, without waiting, when Retry-After is over maxRetryDelayMs', async () => {
    const f = fakeFetch(rateLimited('86400'))
    const err = await failure(client(f).request('POST', '/x'))
    expect(err).toMatchObject({ code: 'RATE_LIMITED', retryAfterSeconds: 86_400 })
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('backs off exponentially with jitter when there is no Retry-After, ignoring RateLimit-*', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const limited = () => json(429, { code: 'RATE_LIMITED', message: 'x' }, { 'ratelimit-reset': '9999' })
    const f = fakeFetch(limited, limited, () => json(200, {}))
    const pending = client(f).request('GET', '/x')
    await vi.advanceTimersByTimeAsync(250)
    expect(f).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(499)
    expect(f).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1)
    expect((await pending).status).toBe(200)
  })

  it('caps backoff at maxRetryDelayMs rather than throwing', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(1)
    const f = fakeFetch(rateLimited(), () => json(200, {}))
    expect((await client(f, { maxRetryDelayMs: 1 }).request('GET', '/x')).status).toBe(200)
  })
})

describe('abort and timeout', () => {
  it('reports ABORTED for an already aborted signal, sending nothing', async () => {
    const f = fakeFetch(() => json(200, {}))
    expect((await failure(client(f).request('GET', '/x', { signal: AbortSignal.abort() }))).code).toBe('ABORTED')
    expect(f).not.toHaveBeenCalled()
  })

  it('reports ABORTED, not retrying, when the caller aborts mid-request', async () => {
    const f = hangingFetch()
    const controller = new AbortController()
    const pending = client(f).request('GET', '/x', { signal: controller.signal })
    await vi.waitFor(() => expect(f).toHaveBeenCalledTimes(1))
    controller.abort()
    expect((await failure(pending)).code).toBe('ABORTED')
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('stops waiting between attempts when the caller aborts', async () => {
    const f = fakeFetch(() => json(429, { code: 'RATE_LIMITED', message: 'x' }, { 'retry-after': '20' }))
    const controller = new AbortController()
    const pending = client(f).request('GET', '/x', { signal: controller.signal })
    await vi.waitFor(() => expect(f).toHaveBeenCalledTimes(1))
    controller.abort()
    expect((await failure(pending)).code).toBe('ABORTED')
  })

  it('does not sit out the wait when the abort lands as the answer arrives', async () => {
    const controller = new AbortController()
    const f = vi.fn<typeof fetch>(async () => {
      controller.abort()
      return json(429, { code: 'RATE_LIMITED', message: 'x' }, { 'retry-after': '20' })
    })
    expect((await failure(client(f).request('GET', '/x', { signal: controller.signal }))).code).toBe('ABORTED')
  })

  it('a per-call timeout overrides the client default', async () => {
    const f = hangingFetch()
    const err = await failure(client(f, { maxRetries: 0 }).request('GET', '/x', { timeoutMs: 5 }))
    expect(err.code).toBe('TIMEOUT')
    expect(err.message).toContain('5 ms')
  })
})

describe('browser writes', () => {
  const browserGlobals: [string, () => void][] = [
    ['a page', () => vi.stubGlobal('document', {})],
    ['a web worker', () => vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (X11) Chrome/130' })]
  ]

  it.each(browserGlobals)('refuses a POST from %s before sending anything', async (_name, stub) => {
    stub()
    const f = fakeFetch(() => json(200, {}))
    const noOrg = createClient({ token: TOKEN, baseUrl: 'https://api.test', fetch: f })
    expect(await failure(noOrg.request('POST', '/x', { body: {} }))).toMatchObject({ code: 'BROWSER_WRITE_UNSUPPORTED', status: 0 })
    expect(f).not.toHaveBeenCalled()
  })

  it.each(browserGlobals)('lets a GET through from %s', async (_name, stub) => {
    stub()
    const f = fakeFetch(() => json(200, {}))
    expect((await client(f).request('GET', '/x')).status).toBe(200)
  })

  it.each(['Cloudflare-Workers', 'Node.js/22', 'Deno/2.0', 'Bun/1.1'])('lets a POST through on %s', async (userAgent) => {
    vi.stubGlobal('navigator', { userAgent })
    const f = fakeFetch(() => json(201, {}))
    expect((await client(f).request('POST', '/x', { body: {} })).status).toBe(201)
  })
})

describe('the token', () => {
  const expectNoToken = (err: HypervalentError) => {
    for (const text of [JSON.stringify(err), inspect(err, { depth: null, showHidden: true }), String(err), err.stack ?? '', err.message]) {
      expect(text).not.toContain(TOKEN)
    }
    expect(err.cause).toBeUndefined()
  }

  it('is not echoed by the error for one a header cannot carry', () => {
    let message = ''
    try {
      createClient({ token: `${TOKEN}\nx` })
    }
    catch (err) {
      message = String(err)
    }
    expect(message).toContain('token')
    expect(message).not.toContain(TOKEN)
  })

  it('is redacted even when it was given with stray whitespace', async () => {
    const f = fakeFetch(() => json(401, { code: 'INVALID_API_TOKEN', message: `Bad ${TOKEN}` }))
    const err = await failure(client(f, { token: `${TOKEN}\n` }).request('GET', '/x'))
    expect(err.message).toBe('Bad [redacted]')
    expect(new Headers(f.mock.calls[0]![1]!.headers).get('authorization')).toBe(`Bearer ${TOKEN}`)
  })

  it('is on no error from an API refusal, even one that echoes it', async () => {
    const f = fakeFetch(() => json(401, {
      code: 'INVALID_API_TOKEN',
      message: `Bad token ${TOKEN}`,
      fields: { authorization: `Bearer ${TOKEN}` },
      unknownExtra: { deep: [TOKEN] }
    }))
    const err = await failure(client(f).request('GET', '/x'))
    expect(err.code).toBe('INVALID_API_TOKEN')
    expect(err.message).toBe('Bad token [redacted]')
    expectNoToken(err)
  })

  it('is on no error from an error page', async () => {
    const f = fakeFetch(() => new Response(`<pre>${TOKEN}</pre>`, { status: 500, headers: { 'content-type': 'text/html' } }))
    expectNoToken(await failure(client(f).request('GET', '/x')))
  })

  it('is on no error when a custom fetch throws one carrying the request', async () => {
    const f = vi.fn<typeof fetch>(async (url, init) => {
      throw Object.assign(new Error(`failed: Bearer ${TOKEN}`), { config: { url, headers: init!.headers } })
    })
    const err = await failure(client(f, { maxRetries: 0 }).request('GET', '/x'))
    expect(err.code).toBe('NETWORK_ERROR')
    expectNoToken(err)
  })

  it('is on no timeout, abort, or browser refusal', async () => {
    expectNoToken(await failure(client(hangingFetch(), { timeoutMs: 5, maxRetries: 0 }).request('GET', '/x')))
    expectNoToken(await failure(client(hangingFetch()).request('GET', '/x', { signal: AbortSignal.abort() })))
    vi.stubGlobal('document', {})
    expectNoToken(await failure(client(hangingFetch()).request('POST', '/x')))
  })

  it('is not readable from the client object', () => {
    const hv = client(fakeFetch())
    expect(JSON.stringify(hv)).not.toContain(TOKEN)
    expect(inspect(hv, { depth: null, showHidden: true })).not.toContain(TOKEN)
  })
})

describe('against a real server, with the native fetch', () => {
  let server: Server | undefined

  afterEach(async () => {
    const running = server
    server = undefined
    if (running) {
      running.closeAllConnections()
      await new Promise(resolve => running.close(resolve))
    }
  })

  const listen = async (handler: Parameters<typeof createServer>[1]) => {
    server = createServer(handler)
    await new Promise<void>(resolve => server!.listen(0, '127.0.0.1', resolve))
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  }

  const real = (baseUrl: string, options: Partial<ClientOptions> = {}) =>
    createClient({ token: TOKEN, org: 'acme', baseUrl, maxRetries: 0, ...options })

  it('reports an HTML 502 as UNEXPECTED_RESPONSE, and recovers on the retry', async () => {
    let calls = 0
    const baseUrl = await listen((req, res) => {
      calls++
      expect(req.headers.authorization).toBe(`Bearer ${TOKEN}`)
      if (calls === 1) {
        res.writeHead(502, { 'content-type': 'text/html', 'retry-after': '0' }).end('<html>Bad gateway</html>')
      }
      else {
        res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}')
      }
    })
    expect(await failure(real(baseUrl).request('GET', '/x'))).toMatchObject({ status: 502, code: 'UNEXPECTED_RESPONSE' })
    expect((await real(baseUrl, { maxRetries: 1 }).request('GET', '/x')).body).toEqual({ ok: true })
  })

  it('does not follow a redirect on a write, which would turn it into a GET', async () => {
    const methods: (string | undefined)[] = []
    const baseUrl = await listen((req, res) => {
      methods.push(req.method)
      if (req.method === 'POST') res.writeHead(301, { location: '/moved' }).end()
      else res.writeHead(200, { 'content-type': 'application/json' }).end('{}')
    })
    expect(await failure(real(baseUrl).request('POST', '/x', { body: {} }))).toMatchObject({ status: 301, code: 'UNEXPECTED_RESPONSE' })
    expect(methods).toEqual(['POST'])
  })

  it('reports a hung server as TIMEOUT', async () => {
    const baseUrl = await listen(() => {})
    expect((await failure(real(baseUrl, { timeoutMs: 20 }).request('GET', '/x'))).code).toBe('TIMEOUT')
  })

  it('reports a body that stalls after the headers as TIMEOUT', async () => {
    const baseUrl = await listen((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' }).write('{')
    })
    expect((await failure(real(baseUrl, { timeoutMs: 50 }).request('GET', '/x'))).code).toBe('TIMEOUT')
  })

  it('reports a refused connection as NETWORK_ERROR, naming the cause', async () => {
    const baseUrl = await listen(() => {})
    const running = server!
    server = undefined
    await new Promise(resolve => running.close(resolve))
    const err = await failure(real(baseUrl).request('GET', '/x'))
    expect(err.code).toBe('NETWORK_ERROR')
    expect(err.message).toContain('ECONNREFUSED')
  })
})
