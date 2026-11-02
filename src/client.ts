import { HypervalentError } from './errors'
import { type ClientResources, clientResources, segment } from './resources'
import { abortable, assertWriteAllowed, type HttpMethod, type HypervalentResponse, isRead, send, type SendOptions, type TransportConfig } from './transport'

export interface ClientOptions<Schema = unknown> {
  /** An `atk_…` API token, sent as `Authorization: Bearer`. */
  token: string
  /** The `org_id`. Omitted, it is read once from `GET /v1/token`. */
  org?: string
  /** Defaults to `https://api.hypervalent.io`. */
  baseUrl?: string
  /** Per attempt. Defaults to 15000. */
  timeoutMs?: number
  /** Defaults to 2. 0 turns retries off. */
  maxRetries?: number
  /** A longer `Retry-After` throws instead of waiting. Defaults to 30000. */
  maxRetryDelayMs?: number
  /** Defaults to the global fetch. For tests, proxies and local TLS. */
  fetch?: typeof fetch
  /** Reserved for the typegen CLI: accepted, with no behavior yet. */
  schema?: Schema
}

export interface RequestOptions extends SendOptions {
  /** Makes `path` relative to `/v1` rather than `/v1/orgs/:org`. */
  orgless?: boolean
}

export interface HypervalentClient<Schema = unknown> extends ClientResources {
  readonly schema: Schema | undefined
  /**
   * Calls any public route. `path` is relative to `/v1/orgs/:org` and is not
   * encoded for you, so the caller URL-encodes its slugs. A `..` that climbs out
   * of that base throws a TypeError.
   */
  request<T = unknown>(method: HttpMethod, path: string, options?: RequestOptions): Promise<HypervalentResponse<T>>
}

/** What `GET /v1/token` tells the client about itself. */
interface Identity {
  org: string
  /** Null on an org-wide token. Undefined when the body did not say. */
  projectSlug: string | null | undefined
}

interface TokenBody {
  org?: { slug?: unknown }
  token?: { projectSlug?: string | null }
}

const MAX_TIMER_MS = 2 ** 31 - 1

function assertRange(name: string, value: number, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new TypeError(`${name} must be between ${min} and ${max}`)
  }
}

export function createClient<Schema = unknown>(options: ClientOptions<Schema>): HypervalentClient<Schema> {
  const { org, schema, baseUrl = 'https://api.hypervalent.io', timeoutMs = 15_000, maxRetries = 2, maxRetryDelayMs = 30_000 } = options
  // Trimmed so a redaction can match it. Refused here because Headers would throw with the value in its message.
  const token = String(options.token ?? '').trim()
  if (!token) throw new TypeError('createClient: token is required')
  if (!/^[\x21-\x7e]+$/.test(token)) throw new TypeError('createClient: token holds characters a header cannot carry')
  assertRange('timeoutMs', timeoutMs, 1, MAX_TIMER_MS)
  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0) throw new TypeError('maxRetries must be a whole number of 0 or more')
  assertRange('maxRetryDelayMs', maxRetryDelayMs, 0, MAX_TIMER_MS)

  // Looked up per call and never stored as a method, or a browser's fetch throws "Illegal invocation".
  const fetchImpl = options.fetch ?? ((input, init) => globalThis.fetch(input, init))
  const config: TransportConfig = { token, timeoutMs, maxRetries, maxRetryDelayMs, fetch: fetchImpl }
  const root = `${baseUrl.replace(/\/+$/, '')}/v1`
  if (!URL.canParse(root)) throw new TypeError('createClient: baseUrl must be an absolute URL')

  let identity: Promise<Identity> | null = null

  /** Runs without any caller's signal, so one caller's abort cannot fail the others sharing it. */
  async function readIdentity(): Promise<Identity> {
    const { status, body } = await send<TokenBody | null>(config, 'GET', `${root}/token`)
    const slug = body?.org?.slug
    if (org || (typeof slug === 'string' && slug)) return { org: org ?? slug as string, projectSlug: body?.token?.projectSlug }
    throw new HypervalentError({
      status,
      code: 'UNEXPECTED_RESPONSE',
      message: 'GET /v1/token did not name an organization. Pass the org option.'
    })
  }

  function resolveIdentity(signal?: AbortSignal): Promise<Identity> {
    if (!identity) {
      const pending = readIdentity()
      identity = pending
      // A failure is not remembered: the next call asks again.
      pending.catch(() => {
        if (identity === pending) identity = null
      })
    }
    return abortable(identity, signal)
  }

  const resolveOrg = async (signal?: AbortSignal) => org ?? (await resolveIdentity(signal)).org

  async function tokenProjectSlug(signal?: AbortSignal): Promise<string> {
    const { projectSlug } = await resolveIdentity(signal)
    if (projectSlug) return projectSlug
    if (projectSlug === undefined) {
      throw new HypervalentError({ status: 200, code: 'UNEXPECTED_RESPONSE', message: 'GET /v1/token did not describe the token. Name a project: hv.project(\'slug\').' })
    }
    throw new HypervalentError({
      status: 0,
      code: 'PROJECT_REQUIRED',
      message: 'This token is not narrowed to a live project. Name one: hv.project(\'slug\').'
    })
  }

  async function request<T = unknown>(method: HttpMethod, path: string, requestOptions: RequestOptions = {}): Promise<HypervalentResponse<T>> {
    if (!path.startsWith('/')) throw new TypeError('request: path must start with "/"')
    const { orgless, query, ...sendOptions } = requestOptions
    // Checked here too, so a refused write spends no request on the org lookup.
    const verb = method.toUpperCase()
    assertWriteAllowed(verb)
    // Fetch would refuse these with a TypeError that reads as a network failure, and retry it.
    if (sendOptions.body !== undefined && isRead(verb)) throw new TypeError(`request: a ${verb} cannot carry a body`)
    if (sendOptions.timeoutMs !== undefined) assertRange('timeoutMs', sendOptions.timeoutMs, 1, MAX_TIMER_MS)

    const base = orgless ? root : `${root}/orgs/${segment('org', await resolveOrg(sendOptions.signal))}`
    const url = new URL(base + path)
    if (!url.pathname.startsWith(`${new URL(base).pathname}/`)) throw new TypeError('request: path must stay under its base')
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
    return send<T>(config, method, url.href, sendOptions)
  }

  return { schema, request, ...clientResources(request, tokenProjectSlug) }
}
