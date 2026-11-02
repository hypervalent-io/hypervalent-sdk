# Hypervalent SDK for TypeScript

TypeScript client for the Hypervalent public API. Node 22+, modern browsers, Cloudflare Workers, Deno and Bun, with zero runtime dependencies.

> **Status: early.** The package covers every public API operation and webhook verification. Its first npm release, 0.1.0, is prepared and not yet published.

## Usage

```ts
import { createClient, isHypervalentError } from '@hypervalent-io/sdk'

const hv = createClient({ token: process.env.HYPERVALENT_TOKEN!, org: 'acme' })

await hv.whoami()                     // the token, its organization and its features

const site = hv.project('marketing')  // omit the slug on a project-narrowed token

const { document } = await site.documents('post').create({ title: 'Hello' })
await site.documents('post').publish(document.slug)

try {
  const page = await site.documents('post').list({ limit: 50 })
  console.log(page.documents.results, page.documents.count)
}
catch (err) {
  if (isHypervalentError(err) && err.code === 'RATE_LIMITED') console.log(err.retryAfterSeconds)
}
```

| Option | Default | Notes |
|---|---|---|
| `token` | required | Never logged or put on an error |
| `org` | read once from `GET /v1/token` | The `org_id`. Pass it to save that request. See [Workers](#cloudflare-workers) |
| `baseUrl` | `https://api.hypervalent.io` | |
| `timeoutMs` | `15000` | Per attempt; each call can override it. Media uploads default to `60000` |
| `maxRetries` | `2` | `0` turns retries off |
| `maxRetryDelayMs` | `30000` | A longer `Retry-After` throws instead of waiting |
| `fetch` | global `fetch` | For tests, proxies and local TLS |

### Resources

| Under | Methods |
|---|---|
| `hv` | `whoami()`, `orgToken()`, `project(slug?)`, `request()` |
| `hv.projects` | `list()`, `pages()`, `iterate()` |
| `site.documents(doctype)`, `site.terms(taxonomy)` | `list()`, `pages()`, `iterate()`, `get()`, `create()`, `update()`, `publish()`, `unpublish()`, `trash()` |
| `site.doctypes`, `site.taxonomies`, `site.atoms`, `site.molecules` | `list()`, `get()`, `create()`, `update()` |
| `site.settings` | `list()`, `get()` |
| `site.designTokens` | `list()`, `update()`, `schemes()`, `theme()`, `updateTheme()`, `css()`, `w3c()` |
| `site.library` | `list()`, `plan(items)`, `insert(items)` |
| `site.media` | `upload(files)`, `uploadFromUrl(url)` |

Each method answers the API's response body as is, and takes the route's query parameters as the API spells them (`status`, `token_type`) plus `signal` and `timeoutMs`. Slugs are URL-encoded for you. A slug that is empty, `.` or `..` is a `TypeError`, because a URL parser would turn it into another route.

**Without a slug, `hv.project()` reads the token's project** from `GET /v1/token`, once. On an org-wide token, the first call throws `PROJECT_REQUIRED`.

### Lists

`documents`, `terms` and `projects` are paged, and the rest answer their full set from `list()`.

```ts
const posts = site.documents('post')

await posts.list({ page: 2 })                   // one page, always exactly one request
for await (const page of posts.pages()) {}      // each page's envelope, with its referenced media
for await (const post of posts.iterate()) {}    // every row, one request per page
```

`pages()` and `iterate()` ask for 50 rows a page, the API's maximum, unless you pass `limit`.

**A walk is not a snapshot.** Paging is by offset, so a row inserted mid-walk can shift a page boundary. `iterate()` removes the repeats that causes, but a row can still be skipped when one is removed. A build that must be exact re-runs on the matching webhook.

`terms(taxonomy).list()` answers the whole taxonomy read, since the API serves a taxonomy's terms inside it. The rows are at `.terms.results`.

### Root atoms

The SDK passes these through as the API defines them. Reads answer an array of `{ uuid, value, locked, required }`, and writes take an object keyed by atom uuid:

```ts
const { version } = await posts.get('hello')    // version.rootAtoms: [{ uuid, value, … }]
await posts.update('hello', { rootAtoms: { [atomUuid]: 'New value' } })
```

With a [generated schema](#typed-content), reads and writes use field slugs instead.

### Typed content

`typegen` reads one project's content model and writes a typed schema. It is a value, not only types, because a field slug becomes an atom uuid at run time:

```bash
HYPERVALENT_TOKEN=atk_… npx @hypervalent-io/sdk typegen --project marketing --out src/hypervalent.schema.ts
```

```ts
import { createClient } from '@hypervalent-io/sdk'
import { schema } from './hypervalent.schema'

const site = createClient({ token, schema }).project()
const posts = site.documents('post')

await posts.create({
  title: 'Hello',
  rootAtoms: { headline: 'Hi', hero: [imageUuid] },
  blocks: [{ molecule: 'card', atoms: { headline: 'Nested' } }]
})
const { version } = await posts.get('hello')
version?.rootAtoms.headline     // string | null
version?.blocks                 // the content tree, with molecule slugs
```

**The output is a snapshot, and runtime values are not validated against it.** An edit in Studio can make it stale, so run `typegen` again when the content model changes. A field added since is in `unmappedRootAtoms`, and a molecule added since reads as `molecule: null`. Image, file and video fields are always arrays of strings.

- A write that does not fit is refused before any request with `SCHEMA_VALIDATION`, whose `fields` names every problem.
- The schema belongs to one project. Used with any other, `documents()` and `terms()` throw `SCHEMA_PROJECT_MISMATCH` rather than send its uuids. That check costs one read of the project list per client.
- `--status draft` generates from the working structure and needs a `read_write` token on a plan with API writes. Any other token sees published structure only.
- `taxonomyTerms` still takes term uuids.

### Media

```ts
import { resolveFieldMedia } from '@hypervalent-io/sdk'

const { images, errors } = await site.media.upload(new File([bytes], 'hero.png'), { alt: 'Hero' })
const { image } = await site.media.uploadFromUrl('https://example.com/hero.png')

const read = await posts.get('hello')
const assets = resolveFieldMedia(read, 'video', atom.value)
```

`upload()` takes a `Blob` or `File`, or an array of them. `errors` lists the files that failed when at least one was stored.

`resolveFieldMedia(read, fieldType, value)` looks a field's value up in the read that carried it. It goes by the field's type: `image` reads `referencedImages`, and `file` and `video` read `referencedFiles`. It answers an array in the value's order. A non-uuid string in a file or video field is an external URL and comes back as given, and a uuid the read does not list is left out.

### Any route

`hv.request(method, path, options)` calls any public route, with `path` relative to `/v1/orgs/:org`, which you encode yourself. It takes `query`, `body` (JSON, or a `FormData`), `headers`, `accept`, `signal`, `timeoutMs` and `orgless` (makes `path` relative to `/v1`), and answers `{ status, headers, body }`.

### Errors, retries and browsers

**Every failure throws one `HypervalentError`.** Branch on `code`; `message` is localized. `status` is 0 when there was no HTTP answer, with the code `TIMEOUT`, `NETWORK_ERROR` or `ABORTED`, and also on `PROJECT_REQUIRED` and `BROWSER_WRITE_UNSUPPORTED`, which the SDK raises without sending the call. A non-2xx without our error body is `UNEXPECTED_RESPONSE`, and any 429 is `RATE_LIMITED`.

**A write is never risked twice.** A POST is retried only on a 429. A GET or HEAD is retried on 429, 502, 503, 504, a network error and a timeout. A timed-out write may have landed, so if you need safe re-runs of a create, supply a `slug`: a repeat then answers 409 `SLUG_CONFLICT`.

**Browsers can read but not write.** The public API's CORS policy has no POST, so the SDK throws `BROWSER_WRITE_UNSUPPORTED` before sending one. Any token in a browser bundle is public, so only a project-narrowed `read` token belongs there.

### Cloudflare Workers

Pass `org`, and a slug to `hv.project()`, if a client lives at module scope. Without them the client reads `GET /v1/token` once and shares that lookup between callers, and a Worker's request cannot wait on I/O started by another request, so it may hang. We reasoned this from the Workers model and have not reproduced it. Creating the client per request also avoids it.

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
npm run verify   # lint, check, typecheck, test, build, Node smoke, Workers bundle, release and package checks
```

| Script | Does |
|---|---|
| `npm run generate` | Regenerates `src/generated/` from `openapi.json` |
| `npm run check` | Fails if `src/generated/` differs from a fresh generation |
| `npm run build` | Builds ESM and CJS with type declarations into `dist/`, then the CLI |
| `npm run lint` / `lint:ci` | ESLint, fixing / not fixing |
| `npm run typecheck` | `tsc` over the source and the tests |
| `npm test` | Vitest, including the webhook verifier running in workerd |
| `npm run smoke` | Imports the built package in Node, as ESM and CJS |
| `npm run check:workers` | Bundles the built package for Workers, failing on any Node built-in |
| `npm run check:release` | Fails unless `package.json` and `CHANGELOG.md` are ready to release |
| `npm run check:package` | Installs the packed tarball in a new project and runs a read from it, as ESM and CJS, and its CLI, against a local server |
| `npm run release:dry-run` | `npm publish --dry-run`: shows what would ship and publishes nothing |
| `npm run spec:drift` | Compares `openapi.json` with the published spec |
| `npm run spec:sync` | Replaces `openapi.json` with the published spec and regenerates |

## API spec

`openapi.json` is a vendored copy of [the published spec](https://docs.hypervalent.io/openapi.json). Never edit it or `src/generated/` by hand. A scheduled workflow fails when the copy falls behind; `npm run spec:sync` brings it up to date.

## Releasing

A `vX.Y.Z` tag on `main` publishes to npm through `.github/workflows/release.yml`, using trusted publishing with provenance. No npm token exists, and none should be created. The tag must match `package.json`, and `CHANGELOG.md` must have a section for the version, so set both in a pull request before tagging.

## License

[MIT](LICENSE)
