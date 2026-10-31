# Hypervalent SDK for TypeScript

TypeScript client for the Hypervalent public API. Node 22+, modern browsers, Cloudflare Workers, Deno and Bun, with zero runtime dependencies.

> **Status: early.** The package ships the generated API types, the transport and webhook verification below, and is not yet published to npm. The resource client (`hv.project(…).documents(…)`) follows.

## Usage

```ts
import { createClient, isHypervalentError } from '@hypervalent-io/sdk'

const hv = createClient({ token: process.env.HYPERVALENT_TOKEN! })

try {
  // Relative to /v1/orgs/:org. The org is read once from GET /v1/token unless you pass `org`.
  const { body } = await hv.request('GET', '/projects', { query: { limit: 50 } })
}
catch (err) {
  if (isHypervalentError(err) && err.code === 'RATE_LIMITED') console.log(err.retryAfterSeconds)
}
```

| Option | Default | Notes |
|---|---|---|
| `token` | required | Never logged or put on an error |
| `org` | read from `GET /v1/token` | The `org_id` |
| `baseUrl` | `https://api.hypervalent.io` | |
| `timeoutMs` | `15000` | Per attempt; `request()` can override it |
| `maxRetries` | `2` | `0` turns retries off |
| `maxRetryDelayMs` | `30000` | A longer `Retry-After` throws instead of waiting |
| `fetch` | global `fetch` | For tests, proxies and local TLS |

`request()` also takes `query`, `body` (JSON, or a `FormData`), `headers`, `accept`, `signal`, `timeoutMs` and `orgless` (makes `path` relative to `/v1`). It answers `{ status, headers, body }`.

**Every failure throws one `HypervalentError`.** Branch on `code`; `message` is localized. `status` is 0 when there was no HTTP answer, with the code `TIMEOUT`, `NETWORK_ERROR` or `ABORTED`. A non-2xx without our error body is `UNEXPECTED_RESPONSE`, and any 429 is `RATE_LIMITED`.

**A write is never risked twice.** A POST is retried only on a 429. A GET or HEAD is retried on 429, 502, 503, 504, a network error and a timeout. A timed-out write may have landed, so if you need safe re-runs of a create, supply a `slug`: a repeat then answers 409 `SLUG_CONFLICT`.

**Browsers can read but not write.** The public API's CORS policy has no POST, so the SDK throws `BROWSER_WRITE_UNSUPPORTED` before sending one. Any token in a browser bundle is public, so only a project-narrowed `read` token belongs there.

## Verifying webhooks

`@hypervalent-io/sdk/webhooks` checks a delivery's `X-Hypervalent-Signature` header, with WebCrypto and a constant-time comparison, on every runtime above. It needs no client or token.

```ts
import { isWebhookVerificationError, verifyWebhook } from '@hypervalent-io/sdk/webhooks'

export default {
  async fetch(request: Request, env: { WEBHOOK_SECRET: string }) {
    try {
      const event = await verifyWebhook({
        rawBody: await request.text(),
        signature: request.headers.get('x-hypervalent-signature'),
        secret: env.WEBHOOK_SECRET
      })
      console.log(event.event, event.details.documentSlug)
      return new Response(null, { status: 204 })
    }
    catch (err) {
      if (isWebhookVerificationError(err)) return new Response(err.code, { status: 400 })
      throw err
    }
  }
}
```

**Pass the body as received.** The signature covers the raw bytes, so a body that has been through `JSON.parse` and back no longer matches. In Express, read it with `express.raw({ type: 'application/json' })`.

| `err.code` | Means |
|---|---|
| `MALFORMED_SIGNATURE` | The header is missing or is not `t=<unix>,v1=<64 lowercase hex>` |
| `INVALID_SIGNATURE` | The body, the timestamp or the secret does not match |
| `STALE_TIMESTAMP` | The signature is right, but `t` is over `toleranceSeconds` (default 300) from this clock, either way |
| `INVALID_PAYLOAD` | The signature is right, but the body is not a UTF-8 JSON object |

The timestamp bounds replay rather than ending it: each attempt is signed afresh, and a retry keeps its `id`, so dedupe on `event.id` if a handler must run once. During a secret rotation, the next attempt is signed with the new secret. A wrong argument, such as an empty secret, is a `TypeError`.

## Development

```bash
npm ci
npm run verify   # lint, check, typecheck, test, build, Node smoke, Workers bundle
```

| Script | Does |
|---|---|
| `npm run generate` | Regenerates `src/generated/` from `openapi.json` |
| `npm run check` | Fails if `src/generated/` differs from a fresh generation |
| `npm run build` | Builds ESM and CJS with type declarations into `dist/` |
| `npm run lint` / `lint:ci` | ESLint, fixing / not fixing |
| `npm run typecheck` | `tsc` over the source and the tests |
| `npm test` | Vitest, including the webhook verifier running in workerd |
| `npm run smoke` | Imports the built package in Node, as ESM and CJS |
| `npm run check:workers` | Bundles the built package for Workers, failing on any Node built-in |
| `npm run spec:drift` | Compares `openapi.json` with the published spec |
| `npm run spec:sync` | Replaces `openapi.json` with the published spec and regenerates |

## API spec

`openapi.json` is a vendored copy of [the published spec](https://docs.hypervalent.io/openapi.json). Never edit it or `src/generated/` by hand. A scheduled workflow fails when the copy falls behind; `npm run spec:sync` brings it up to date.

## License

[MIT](LICENSE)
