import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { nodeBuiltinsInBundle } from '../scripts/lib/workers-bundle.mjs'

import { build } from 'esbuild'
import { Miniflare } from 'miniflare'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Runs the verifier in workerd, the real Workers runtime, not a Node imitation.

const SOURCE = join(import.meta.dirname, '..', 'src', 'webhooks.ts')

const vector = JSON.parse(await readFile(join(import.meta.dirname, 'fixtures', 'webhook-vector.json'), 'utf8')) as {
  secret: string
  body: string
  signature: string
}

// Long enough to outlast the vector's fixed timestamp.
const TOLERANCE = 100 * 365 * 24 * 3600

const WORKER = `
import { isWebhookVerificationError, verifyWebhook } from ${JSON.stringify(SOURCE)}
export default {
  async fetch(request) {
    if (new URL(request.url).pathname === '/runtime') return new Response(navigator.userAgent)
    try {
      const options = await request.json()
      return Response.json({ event: await verifyWebhook(options) })
    }
    catch (err) {
      return Response.json({ code: isWebhookVerificationError(err) ? err.code : String(err) })
    }
  }
}
`

describe('verifyWebhook in workerd', () => {
  let worker: Miniflare

  beforeAll(async () => {
    const bundled = await build({
      stdin: { contents: WORKER, resolveDir: import.meta.dirname, loader: 'js' },
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      conditions: ['worker', 'browser']
    })
    worker = new Miniflare({
      modules: true,
      script: bundled.outputFiles[0]!.text,
      compatibilityDate: '2026-07-01'
    })
  })

  afterAll(() => worker?.dispose())

  const send = async (overrides: object) => {
    const response = await worker.dispatchFetch('http://webhook.test/', {
      method: 'POST',
      body: JSON.stringify({
        rawBody: vector.body,
        signature: vector.signature,
        secret: vector.secret,
        toleranceSeconds: TOLERANCE,
        ...overrides
      })
    })
    return response.json() as Promise<{ code?: string, event?: { event: string } }>
  }

  it('is really running on workerd', async () => {
    const response = await worker.dispatchFetch('http://webhook.test/runtime')
    expect(await response.text()).toBe('Cloudflare-Workers')
  })

  it('passes the shared vector', async () => {
    expect((await send({})).event?.event).toBe('version.publish')
  })

  it('refuses a tampered body', async () => {
    expect((await send({ rawBody: `${vector.body} ` })).code).toBe('INVALID_SIGNATURE')
  })

  it('refuses a wrong secret', async () => {
    expect((await send({ secret: 'whsec_wrong' })).code).toBe('INVALID_SIGNATURE')
  })

  it('refuses a stale timestamp', async () => {
    expect((await send({ toleranceSeconds: 300 })).code).toBe('STALE_TIMESTAMP')
  })

  it('refuses a malformed header', async () => {
    expect((await send({ signature: 'nonsense' })).code).toBe('MALFORMED_SIGNATURE')
  })

  it('needs no Node built-in', async () => {
    expect(await nodeBuiltinsInBundle(SOURCE)).toEqual([])
  })
})
