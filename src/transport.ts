import { errorFromResponse, HypervalentError } from './errors'

export type HttpMethod = 'GET' | 'HEAD' | 'POST'

export type QueryValue = string | number | boolean | null | undefined

export interface SendOptions {
  /** Added to the URL. `null` and `undefined` values are left out. */
  query?: Record<string, QueryValue>
  /** Sent as JSON, or as multipart when it is a FormData. */
  body?: unknown
  headers?: HeadersInit
  /** Defaults to `application/json`. */
  accept?: string
  signal?: AbortSignal
  /** Per attempt. Overrides the client's `timeoutMs`. */
  timeoutMs?: number
}

export interface HypervalentResponse<T = unknown> {
  status: number
  headers: Headers
  /** Parsed JSON, or text for any other content type, or null when the body is empty. */
  body: T
}

export interface TransportConfig {
  token: string
  timeoutMs: number
  maxRetries: number
  maxRetryDelayMs: number
  fetch: typeof fetch
}

const BACKOFF_BASE_MS = 500
const RETRYABLE_READ_STATUSES = new Set([429, 502, 503, 504])

export const isRead = (method: string) => method === 'GET' || method === 'HEAD'

/**
 * Is this a browser page or browser worker? Cloudflare Workers, Node, Deno and
 * Bun have no `document` and name themselves in `navigator.userAgent`.
 */
function inBrowser(): boolean {
  if ('document' in globalThis) return true
  return (globalThis as { navigator?: { userAgent?: string } }).navigator?.userAgent?.startsWith('Mozilla/') === true
}

/** The public CORS policy has no POST, so a browser would refuse with an opaque TypeError. */
export function assertWriteAllowed(method: string): void {
  if (isRead(method) || !inBrowser()) return
  throw new HypervalentError({
    status: 0,
    code: 'BROWSER_WRITE_UNSUPPORTED',
    message: 'The Hypervalent public API refuses writes from a browser. Send them from a server.'
  })
}

const abortedError = () => new HypervalentError({ status: 0, code: 'ABORTED', message: 'The request was aborted' })

/** Waits, or rejects as ABORTED if the caller's signal fires first. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    // A listener added now would never fire.
    if (signal?.aborted) {
      reject(abortedError())
      return
    }
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortedError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** Settles with the promise, or rejects as ABORTED if the caller's signal fires first. */
export function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortedError())
      return
    }
    const onAbort = () => reject(abortedError())
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
  })
}

function parseBody(text: string, contentType: string, status: number): unknown {
  if (text === '') return null
  if (!/\bjson\b/i.test(contentType)) return text
  try {
    return JSON.parse(text)
  }
  catch {
    throw new HypervalentError({
      status,
      code: 'UNEXPECTED_RESPONSE',
      message: 'The Hypervalent API answered with a body that is not valid JSON'
    })
  }
}

/** A failed attempt. `transient` means a timeout or network error, with no complete HTTP answer. */
interface Failure {
  error: HypervalentError
  transient: boolean
}

const shouldRetry = (method: string, { error, transient }: Failure) => {
  // A write that may have reached a handler must never be sent twice. A 429
  // is the only answer proving it did not: the limiter refuses first.
  if (!isRead(method)) return error.status === 429
  return transient || RETRYABLE_READ_STATUSES.has(error.status)
}

/** One attempt: fetch and body read share a timeout, so a stalled body counts as a timeout. */
async function attempt(config: TransportConfig, url: string, init: RequestInit, options: SendOptions): Promise<HypervalentResponse | Failure> {
  const timeoutMs = options.timeoutMs ?? config.timeoutMs
  const timeout = AbortSignal.timeout(timeoutMs)
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
  try {
    const response = await config.fetch(url, { ...init, signal })
    const text = await response.text()
    // 304 is the answer to a caller's If-None-Match, not a failure.
    if (response.ok || response.status === 304) {
      return { status: response.status, headers: response.headers, body: parseBody(text, response.headers.get('content-type') ?? '', response.status) }
    }
    // The API should never echo a credential, and no error may ever hold one.
    const safeText = text.replaceAll(config.token, '[redacted]')
    return { error: errorFromResponse(response.status, response.headers.get('retry-after'), safeText), transient: false }
  }
  catch (err) {
    if (err instanceof HypervalentError) return { error: err, transient: false }
    if (options.signal?.aborted) return { error: abortedError(), transient: false }
    const error = timeout.aborted
      ? new HypervalentError({ status: 0, code: 'TIMEOUT', message: `The Hypervalent API did not answer within ${timeoutMs} ms` })
      : new HypervalentError({ status: 0, code: 'NETWORK_ERROR', message: networkMessage(err, config.token) })
    return { error, transient: true }
  }
}

/** Names the underlying failure (a refused connection, a TLS problem), minus any token. */
function networkMessage(err: unknown, token: string): string {
  const { message, cause } = (err ?? {}) as { message?: unknown, cause?: { code?: unknown, message?: unknown } }
  const reason = [cause?.code, cause?.message, message].find((text): text is string => typeof text === 'string' && text !== '')
  const base = 'The Hypervalent API could not be reached'
  return reason ? `${base}: ${reason.replaceAll(token, '[redacted]')}` : base
}

/** The wait before retry `retry` (0-based): Retry-After when present, otherwise backoff with jitter. */
function waitMs(error: HypervalentError, retry: number, maxRetryDelayMs: number): number {
  if (error.retryAfterSeconds !== undefined) return error.retryAfterSeconds * 1000
  const ceiling = Math.min(BACKOFF_BASE_MS * 2 ** retry, maxRetryDelayMs)
  return ceiling / 2 + Math.random() * ceiling / 2
}

/** Sends to a complete URL under the retry rule. Throws HypervalentError on every failure. */
export async function send<T>(config: TransportConfig, methodName: string, url: string, options: SendOptions = {}): Promise<HypervalentResponse<T>> {
  const method = methodName.toUpperCase()
  assertWriteAllowed(method)

  const headers = new Headers(options.headers)
  if (options.accept !== undefined || !headers.has('accept')) headers.set('accept', options.accept ?? 'application/json')
  // Last, so a caller's headers can never replace the credential.
  headers.set('authorization', `Bearer ${config.token}`)

  const init: RequestInit = { method, headers }
  // A followed 301 or 302 turns a POST into a GET, whose 200 would report a write that never happened.
  if (!isRead(method)) init.redirect = 'manual'
  if (options.body instanceof FormData) {
    // Fetch sets the multipart boundary itself.
    headers.delete('content-type')
    init.body = options.body
  }
  else if (options.body !== undefined) {
    headers.set('content-type', 'application/json')
    init.body = JSON.stringify(options.body)
  }

  for (let retry = 0; ; retry++) {
    if (options.signal?.aborted) throw abortedError()
    const result = await attempt(config, url, init, options)
    if (!('error' in result)) return result as HypervalentResponse<T>
    if (retry >= config.maxRetries || !shouldRetry(method, result)) throw result.error
    const wait = waitMs(result.error, retry, config.maxRetryDelayMs)
    if (wait > config.maxRetryDelayMs) throw result.error
    await sleep(wait, options.signal)
  }
}
