/**
 * Verifies a delivery's X-Hypervalent-Signature header. Its own entry point,
 * `@hypervalent-io/sdk/webhooks`, because a receiver needs no client or token.
 *
 * The format is the receiver contract in the API's outbound webhooks, and a
 * shared test vector holds this code and the API's signer to it.
 */

/** Why a delivery was refused. Stable, so branch on it; `message` may change. */
export type WebhookVerificationErrorCode
  = | 'MALFORMED_SIGNATURE'
    | 'INVALID_SIGNATURE'
    | 'STALE_TIMESTAMP'
    | 'INVALID_PAYLOAD'

const BRAND = Symbol.for('hypervalent.sdk.webhookVerificationError')

export class WebhookVerificationError extends Error {
  readonly code: WebhookVerificationErrorCode

  constructor(code: WebhookVerificationErrorCode, message: string) {
    super(message)
    this.name = 'WebhookVerificationError'
    this.code = code
    Object.defineProperty(this, BRAND, { value: true })
  }
}

/** Reads the brand, not the prototype, so it holds across the ESM and CJS builds. */
export function isWebhookVerificationError(err: unknown): err is WebhookVerificationError {
  return typeof err === 'object' && err !== null && (err as Record<symbol, unknown>)[BRAND] === true
}

export type WebhookActorType = 'user' | 'api_token' | 'system' | 'operator' | (string & {})

export interface WebhookActor {
  type: WebhookActorType
  /** The member for a user actor, which can also be null. Always null for an operator, a token or the system. */
  uuid: string | null
  /** The API token, for a write made through the public API. */
  apiTokenUuid: string | null
}

export interface WebhookTarget {
  /** Null on a `ping`. */
  type: string | null
  uuid: string | null
  title: string
}

/**
 * Differs by event: a changed-field diff or a count summary. The addressing
 * keys are on content events, and absent when the lookup missed.
 */
export interface WebhookDetails {
  changedFields?: string[]
  documentUuid?: string
  documentSlug?: string
  doctypeSlug?: string
  termUuid?: string
  termSlug?: string
  taxonomySlug?: string
  [key: string]: unknown
}

export interface WebhookEvent {
  /** The delivery uuid, also in X-Hypervalent-Delivery. Stable across retries, so use it to dedupe. */
  id: string
  /** An admin event such as `version.publish`, or `ping` for a test delivery. */
  event: string
  /** When the delivery was created, ISO 8601. A retry keeps it. */
  timestamp: string
  org: string
  project: string | null
  target: WebhookTarget
  /** Absent on a stored delivery older than the field, because retries replay the stored body. */
  actor?: WebhookActor
  details: WebhookDetails
}

export interface VerifyWebhookOptions {
  /** The request body exactly as received, before any JSON parsing. */
  rawBody: string | Uint8Array | ArrayBuffer
  /** The X-Hypervalent-Signature header. A missing header is refused, so pass it as you get it. */
  signature: string | null | undefined
  /** The subscription's whole secret, `whsec_` included. */
  secret: string
  /** How far `t` may be from this machine's clock, either way. Default 300. */
  toleranceSeconds?: number
}

const DEFAULT_TOLERANCE_SECONDS = 300
const MAC_HEX = /^[0-9a-f]{64}$/
const DIGITS = /^[0-9]+$/

/** Throws MALFORMED_SIGNATURE. Fields other than `t` and `v1` are ignored, so a later scheme can sit beside `v1`. */
function parseSignature(header: string | null | undefined): { timestamp: string, mac: string } {
  const timestamps: string[] = []
  const macs: string[] = []
  for (const part of (header ?? '').split(',')) {
    const separator = part.indexOf('=')
    if (separator < 1) continue
    const key = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (key === 't') timestamps.push(value)
    else if (key === 'v1') macs.push(value)
  }
  const [timestamp] = timestamps
  const [mac] = macs
  if (
    timestamp === undefined || mac === undefined
    || timestamps.length > 1 || macs.length > 1
    || !DIGITS.test(timestamp) || !Number.isSafeInteger(Number(timestamp))
    || !MAC_HEX.test(mac)
  ) {
    throw new WebhookVerificationError('MALFORMED_SIGNATURE', 'The webhook signature header is missing or malformed')
  }
  return { timestamp, mac }
}

function bodyBytes(rawBody: VerifyWebhookOptions['rawBody'], encoder: TextEncoder): Uint8Array {
  if (typeof rawBody === 'string') return encoder.encode(rawBody)
  // Not instanceof: a Buffer or ArrayBuffer from another realm (Jest, a vm sandbox) would fail it.
  if (ArrayBuffer.isView(rawBody)) return new Uint8Array(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength)
  if (Object.prototype.toString.call(rawBody) === '[object ArrayBuffer]') return new Uint8Array(rawBody)
  throw new TypeError('rawBody must be the unparsed request body: a string, Uint8Array or ArrayBuffer')
}

/**
 * Resolves to the parsed payload, and rejects with a WebhookVerificationError
 * if the delivery cannot be trusted. Returning the payload rather than a
 * boolean means a forgotten `await` cannot read as a pass.
 *
 * A bad argument is a bug in the receiver rather than a bad delivery, so it is
 * a TypeError.
 */
export async function verifyWebhook(options: VerifyWebhookOptions): Promise<WebhookEvent> {
  const { rawBody, signature, secret, toleranceSeconds = DEFAULT_TOLERANCE_SECONDS } = options
  if (typeof secret !== 'string' || secret === '') {
    throw new TypeError('secret must be a non-empty string')
  }
  if (!Number.isFinite(toleranceSeconds) || toleranceSeconds < 0) {
    throw new TypeError('toleranceSeconds must be a non-negative number')
  }
  const encoder = new TextEncoder()
  const body = bodyBytes(rawBody, encoder)
  const { timestamp, mac } = parseSignature(signature)

  // The MAC covers the header's own digits, not a number re-rendered from them.
  const prefix = encoder.encode(`${timestamp}.`)
  const signed = new Uint8Array(prefix.length + body.length)
  signed.set(prefix)
  signed.set(body, prefix.length)

  const expected = new Uint8Array(32)
  for (let i = 0; i < expected.length; i++) {
    expected[i] = Number.parseInt(mac.slice(i * 2, i * 2 + 2), 16)
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  // subtle.verify compares in constant time, so never compare the MAC here.
  if (!await crypto.subtle.verify('HMAC', key, expected, signed)) {
    throw new WebhookVerificationError('INVALID_SIGNATURE', 'The webhook signature does not match')
  }

  // Only now is `t` authenticated, so a well-formed forgery always reads as
  // INVALID_SIGNATURE. Whole seconds, because the signer floors `t`.
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > toleranceSeconds) {
    throw new WebhookVerificationError('STALE_TIMESTAMP', 'The webhook timestamp is outside the tolerance')
  }

  let payload: unknown
  try {
    payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body))
  }
  catch {
    payload = null
  }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new WebhookVerificationError('INVALID_PAYLOAD', 'The webhook body is not a JSON object')
  }
  return payload as WebhookEvent
}
