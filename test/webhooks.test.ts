import { createHmac } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'

import { isWebhookVerificationError, verifyWebhook, type VerifyWebhookOptions, WebhookVerificationError } from '../src/webhooks'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The API repo's signing test asserts these same values.
const vector = JSON.parse(await readFile(join(import.meta.dirname, 'fixtures', 'webhook-vector.json'), 'utf8')) as {
  secret: string
  timestamp: number
  body: string
  signature: string
}

const base: VerifyWebhookOptions = { rawBody: vector.body, signature: vector.signature, secret: vector.secret }
const mac = vector.signature.slice(vector.signature.indexOf('v1=') + 3)

const sign = (body: string, timestamp: number | string, secret = vector.secret) =>
  `t=${timestamp},v1=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`

const refusal = async (options: VerifyWebhookOptions) => {
  const err = await verifyWebhook(options).then(() => null, (reason: unknown) => reason)
  expect(err).toBeInstanceOf(WebhookVerificationError)
  return (err as WebhookVerificationError).code
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(vector.timestamp * 1000)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('the shared vector', () => {
  it('verifies, and answers the parsed payload', async () => {
    const event = await verifyWebhook(base)
    expect(event.event).toBe('version.publish')
    expect(event.target.title).toBe('Café ✓ 日本語')
    expect(event.details.documentSlug).toBe('hello-world')
  })

  it('verifies from bytes as well as a string', async () => {
    const bytes = new TextEncoder().encode(vector.body)
    await expect(verifyWebhook({ ...base, rawBody: bytes })).resolves.toBeTruthy()
    await expect(verifyWebhook({ ...base, rawBody: bytes.buffer as ArrayBuffer })).resolves.toBeTruthy()
    await expect(verifyWebhook({ ...base, rawBody: Buffer.from(vector.body) })).resolves.toBeTruthy()
  })

  it('verifies bytes from another realm, as under Jest or in a vm sandbox', async () => {
    const bytes = new TextEncoder().encode(vector.body)
    const foreign = runInNewContext('(n) => new Uint8Array(n)', {}) as (n: number) => Uint8Array
    const view = foreign(bytes.length)
    view.set(bytes)
    expect(view).not.toBeInstanceOf(Uint8Array)
    expect(view.buffer).not.toBeInstanceOf(ArrayBuffer)
    await expect(verifyWebhook({ ...base, rawBody: view })).resolves.toBeTruthy()
    await expect(verifyWebhook({ ...base, rawBody: view.buffer as ArrayBuffer })).resolves.toBeTruthy()
  })

  it('reads only the view of a pooled buffer', async () => {
    const pool = new Uint8Array(1024)
    const bytes = new TextEncoder().encode(vector.body)
    pool.set(bytes, 7)
    await expect(verifyWebhook({ ...base, rawBody: pool.subarray(7, 7 + bytes.length) })).resolves.toBeTruthy()
  })

  it('still matches what Node signs', () => {
    expect(sign(vector.body, vector.timestamp)).toBe(vector.signature)
  })
})

describe('refusals', () => {
  it('a tampered body', async () => {
    expect(await refusal({ ...base, rawBody: vector.body.replace('hello-world', 'hello-worlds') })).toBe('INVALID_SIGNATURE')
  })

  it('a body re-serialized after parsing, because the signature is over the raw bytes', async () => {
    expect(await refusal({ ...base, rawBody: JSON.stringify(JSON.parse(vector.body), null, 1) })).toBe('INVALID_SIGNATURE')
  })

  it('a wrong secret', async () => {
    expect(await refusal({ ...base, secret: `${vector.secret}0` })).toBe('INVALID_SIGNATURE')
  })

  it('the secret without its whsec_ prefix, because the whole string is the key', async () => {
    expect(await refusal({ ...base, secret: vector.secret.replace('whsec_', '') })).toBe('INVALID_SIGNATURE')
  })

  it.each([
    ['past', 301],
    ['future', -301]
  ])('a timestamp too far in the %s', async (_label, offset) => {
    vi.setSystemTime((vector.timestamp + offset) * 1000)
    expect(await refusal(base)).toBe('STALE_TIMESTAMP')
  })

  it('accepts a timestamp exactly at the tolerance', async () => {
    vi.setSystemTime((vector.timestamp + 300) * 1000)
    await expect(verifyWebhook(base)).resolves.toBeTruthy()
  })

  it('honors toleranceSeconds', async () => {
    vi.setSystemTime((vector.timestamp + 61) * 1000)
    await expect(verifyWebhook({ ...base, toleranceSeconds: 600 })).resolves.toBeTruthy()
    expect(await refusal({ ...base, toleranceSeconds: 60 })).toBe('STALE_TIMESTAMP')
  })

  it('compares whole seconds, so a tolerance of 0 passes within the signing second and refuses the next', async () => {
    vi.setSystemTime(vector.timestamp * 1000 + 900)
    await expect(verifyWebhook({ ...base, toleranceSeconds: 0 })).resolves.toBeTruthy()
    vi.setSystemTime((vector.timestamp + 1) * 1000)
    expect(await refusal({ ...base, toleranceSeconds: 0 })).toBe('STALE_TIMESTAMP')
  })

  it('a timestamp moved to get past the tolerance, because the MAC covers it', async () => {
    vi.setSystemTime((vector.timestamp + 10_000) * 1000)
    expect(await refusal({ ...base, signature: `t=${vector.timestamp + 10_000},v1=${mac}` })).toBe('INVALID_SIGNATURE')
  })

  it('a forged signature on an old timestamp as a bad signature, not as stale', async () => {
    vi.setSystemTime((vector.timestamp + 10_000) * 1000)
    expect(await refusal({ ...base, signature: `t=${vector.timestamp},v1=${'0'.repeat(64)}` })).toBe('INVALID_SIGNATURE')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['empty', ''],
    ['not a signature', 'nonsense'],
    ['no timestamp', `v1=${mac}`],
    ['no MAC', `t=${vector.timestamp}`],
    ['an empty MAC', `t=${vector.timestamp},v1=`],
    ['a short MAC', `t=${vector.timestamp},v1=${mac.slice(2)}`],
    ['a long MAC', `t=${vector.timestamp},v1=${mac}00`],
    ['a non-hex MAC', `t=${vector.timestamp},v1=${'z'.repeat(64)}`],
    ['an uppercase MAC', `t=${vector.timestamp},v1=${mac.toUpperCase()}`],
    ['a non-numeric timestamp', `t=soon,v1=${mac}`],
    ['a negative timestamp', `t=-1,v1=${mac}`],
    ['a fractional timestamp', `t=1.5,v1=${mac}`],
    ['an unsafe timestamp', `t=99999999999999999999,v1=${mac}`],
    ['two timestamps', `t=1,t=${vector.timestamp},v1=${mac}`],
    ['two MACs', `t=${vector.timestamp},v1=${mac},v1=${mac}`]
  ])('a malformed header: %s', async (_label, signature) => {
    expect(await refusal({ ...base, signature })).toBe('MALFORMED_SIGNATURE')
  })

  it('signed bytes that are not JSON', async () => {
    const rawBody = 'not json'
    expect(await refusal({ ...base, rawBody, signature: sign(rawBody, vector.timestamp) })).toBe('INVALID_PAYLOAD')
  })

  it.each(['null', '1', '"text"', '[]'])('signed JSON that is not an object: %s', async (rawBody) => {
    expect(await refusal({ ...base, rawBody, signature: sign(rawBody, vector.timestamp) })).toBe('INVALID_PAYLOAD')
  })

  it('signed bytes that are not UTF-8', async () => {
    const rawBody = Buffer.from('{"a":"\xff"}', 'latin1')
    const mac = createHmac('sha256', vector.secret).update(`${vector.timestamp}.`).update(rawBody).digest('hex')
    expect(await refusal({ ...base, rawBody, signature: `t=${vector.timestamp},v1=${mac}` })).toBe('INVALID_PAYLOAD')
  })
})

describe('header leniency', () => {
  it('ignores a field it does not know, so a later scheme can sit beside v1', async () => {
    await expect(verifyWebhook({ ...base, signature: `${vector.signature},v2=abc` })).resolves.toBeTruthy()
    await expect(verifyWebhook({ ...base, signature: `v0=abc,${vector.signature}` })).resolves.toBeTruthy()
  })

  it('signs over the digits as sent', async () => {
    await expect(verifyWebhook({ ...base, rawBody: '{}', signature: sign('{}', `0${vector.timestamp}`) })).resolves.toEqual({})
  })
})

describe('constant-time comparison', () => {
  it('leaves every well-formed MAC to subtle.verify, wherever it first differs', async () => {
    const verify = vi.spyOn(crypto.subtle, 'verify')
    const flip = (index: number) => {
      const replacement = mac[index] === '0' ? '1' : '0'
      return mac.slice(0, index) + replacement + mac.slice(index + 1)
    }

    for (const wrong of [flip(0), flip(63)]) {
      expect(await refusal({ ...base, signature: `t=${vector.timestamp},v1=${wrong}` })).toBe('INVALID_SIGNATURE')
    }
    await verifyWebhook(base)

    expect(verify).toHaveBeenCalledTimes(3)
    expect(verify.mock.calls.every(([algorithm]) => algorithm === 'HMAC')).toBe(true)
  })
})

describe('bad arguments', () => {
  it.each([
    ['an empty secret', { ...base, secret: '' }],
    ['a missing secret', { ...base, secret: undefined as unknown as string }],
    ['a parsed body', { ...base, rawBody: JSON.parse(vector.body) as string }],
    ['a negative tolerance', { ...base, toleranceSeconds: -1 }],
    ['a NaN tolerance', { ...base, toleranceSeconds: Number.NaN }],
    ['an infinite tolerance', { ...base, toleranceSeconds: Number.POSITIVE_INFINITY }]
  ])('%s is a TypeError', async (_label, options) => {
    await expect(verifyWebhook(options)).rejects.toBeInstanceOf(TypeError)
  })
})

describe('errors', () => {
  it('carry no secret, body or signature', async () => {
    const err = await verifyWebhook({ ...base, secret: 'whsec_other' }).catch((reason: unknown) => reason)
    expect(isWebhookVerificationError(err)).toBe(true)
    const text = JSON.stringify({ ...(err as object), message: (err as Error).message })
    for (const secretValue of ['whsec_other', mac, 'hello-world']) expect(text).not.toContain(secretValue)
  })

  it('isWebhookVerificationError refuses anything else', () => {
    expect(isWebhookVerificationError(new Error('x'))).toBe(false)
    expect(isWebhookVerificationError(null)).toBe(false)
  })
})
