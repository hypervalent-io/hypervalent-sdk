/** Codes the SDK itself assigns, for failures the API never got to describe. */
export type SdkErrorCode
  = | 'TIMEOUT'
    | 'NETWORK_ERROR'
    | 'ABORTED'
    | 'UNEXPECTED_RESPONSE'
    | 'BROWSER_WRITE_UNSUPPORTED'
    | 'PROJECT_REQUIRED'

/** Codes the public API documents. */
export type ApiErrorCode
  = | 'API_TOKEN_REQUIRED'
    | 'INVALID_API_TOKEN'
    | 'TOKEN_ORG_MISMATCH'
    | 'TOKEN_PROJECT_MISMATCH'
    | 'TOKEN_SCOPE_READ_ONLY'
    | 'FEATURE_DISABLED'
    | 'ACCOUNT_CLOSED'
    | 'DELIVERY_BLOCKED'
    | 'BILLING_TERMINATED'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'SLUG_CONFLICT'
    | 'VERSION_LOCKED'
    | 'LIMIT_EXCEEDED'
    | 'UNSUPPORTED_MEDIA_TYPE'
    | 'EMPTY_FILE'
    | 'UPLOAD_FAILED'
    | 'RATE_LIMITED'
    | 'PLATFORM_READ_ONLY'
    | 'PLATFORM_MAINTENANCE'
    | 'QUERY_FAILED'

/** Open on purpose: a code the API adds later is not a breaking change. */

export type HypervalentErrorCode = SdkErrorCode | ApiErrorCode | (string & {})

export interface HypervalentErrorInit {
  status: number
  code: HypervalentErrorCode
  message: string
  requiredPlan?: string | null
  upgrade?: boolean
  feature?: string
  fields?: Record<string, string>
  issues?: { path: string, message: string }[]
  holder?: { name?: string }
  expiresAt?: string
  retryAfterSeconds?: number
  details?: Record<string, unknown>
}

const BRAND = Symbol.for('hypervalent.sdk.error')

/**
 * The one error every failed call throws. It holds nothing about the request,
 * so it cannot leak the token: no headers, no URL, and no `cause`, because a
 * custom fetch's own error may carry the request it was given.
 */
export class HypervalentError extends Error {
  /** The HTTP status, or 0 when there was no HTTP answer. */
  readonly status: number
  /** The stable key to branch on. `message` is localized prose. */
  readonly code: HypervalentErrorCode
  // `declare`, or ES2022 class fields would make every absent extra an own `undefined`.
  declare readonly requiredPlan?: string | null
  declare readonly upgrade?: boolean
  declare readonly feature?: string
  declare readonly fields?: Record<string, string>
  declare readonly issues?: { path: string, message: string }[]
  declare readonly holder?: { name?: string }
  declare readonly expiresAt?: string
  declare readonly retryAfterSeconds?: number
  /** The API's whole error envelope, including fields the SDK does not name. */
  declare readonly details?: Record<string, unknown>

  constructor(init: HypervalentErrorInit) {
    super(init.message)
    this.name = 'HypervalentError'
    Object.defineProperty(this, BRAND, { value: true })
    this.status = init.status
    this.code = init.code
    if (init.requiredPlan !== undefined) this.requiredPlan = init.requiredPlan
    if (init.upgrade !== undefined) this.upgrade = init.upgrade
    if (init.feature !== undefined) this.feature = init.feature
    if (init.fields !== undefined) this.fields = init.fields
    if (init.issues !== undefined) this.issues = init.issues
    if (init.holder !== undefined) this.holder = init.holder
    if (init.expiresAt !== undefined) this.expiresAt = init.expiresAt
    if (init.retryAfterSeconds !== undefined) this.retryAfterSeconds = init.retryAfterSeconds
    if (init.details !== undefined) this.details = init.details
  }

  /** An Error's message is not enumerable, so JSON.stringify would drop it. */
  toJSON(): object {
    return { ...this, name: this.name, message: this.message }
  }
}

/** Reads the brand, not the prototype, so it holds across the ESM and CJS builds. */
export function isHypervalentError(err: unknown): err is HypervalentError {
  return typeof err === 'object' && err !== null && (err as Record<symbol, unknown>)[BRAND] === true
}

/** Whole seconds from a Retry-After value (seconds or HTTP date), or null if it is neither. */
export function parseRetryAfter(header: string | null, now = Date.now()): number | null {
  const value = header?.trim()
  if (!value) return null
  if (/^\d+$/.test(value)) return Number(value)
  // Date.parse also reads strings like "1.5" as dates. An HTTP date always names a month.
  if (!/[a-z]/i.test(value)) return null
  const at = Date.parse(value)
  return Number.isNaN(at) ? null : Math.max(0, Math.ceil((at - now) / 1000))
}

type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Handlers answer the envelope flat and middleware nests it under `error`. Unwrap once. */
function parseEnvelope(text: string): JsonObject | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  }
  catch {
    return null
  }
  if (!isObject(parsed)) return null
  const envelope = isObject(parsed.error) ? parsed.error : parsed
  return typeof envelope.code === 'string' ? envelope : null
}

/** Builds the error for a non-2xx answer from its status, Retry-After header and body text. */
export function errorFromResponse(status: number, retryAfter: string | null, text: string): HypervalentError {
  const envelope = parseEnvelope(text)
  const seconds = parseRetryAfter(retryAfter)
  const init: HypervalentErrorInit = {
    status,
    code: 'UNEXPECTED_RESPONSE',
    message: `The Hypervalent API answered HTTP ${status} without an error body`
  }
  if (envelope) {
    init.code = envelope.code as string
    if (typeof envelope.message === 'string') init.message = envelope.message
    init.details = envelope
    if (typeof envelope.requiredPlan === 'string' || envelope.requiredPlan === null) init.requiredPlan = envelope.requiredPlan
    if (typeof envelope.upgrade === 'boolean') init.upgrade = envelope.upgrade
    if (typeof envelope.feature === 'string') init.feature = envelope.feature
    if (isObject(envelope.fields)) init.fields = envelope.fields as Record<string, string>
    if (Array.isArray(envelope.issues)) init.issues = envelope.issues
    if (isObject(envelope.holder)) init.holder = envelope.holder
    if (typeof envelope.expiresAt === 'string') init.expiresAt = envelope.expiresAt
  }
  // Any 429, from our limiters or an edge in front of them.
  if (status === 429) {
    init.code = 'RATE_LIMITED'
    if (!envelope) init.message = 'Rate limited by the Hypervalent API'
  }
  if (seconds !== null) init.retryAfterSeconds = seconds
  return new HypervalentError(init)
}
