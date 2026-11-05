# Changelog

Each release of `@hypervalent-io/sdk` has a section here, and a `vX.Y.Z` tag cannot publish without one. Before 1.0.0 a minor version may break the client's API.

## 0.4.0

The `json` field type, and wire types synced to API spec 1.10.0.

- Typegen maps a `json` field to `string`: the value is the JSON text exactly as the author wrote it, and your code runs `JSON.parse` on it. The API refuses a write whose JSON does not parse with 422 `VALIDATION_ERROR`
- `AtomWrite.fieldType` and the other field-type unions include `json` (spec 1.10.0; 1.9.0 changed a description only)

## 0.3.0

Media library reads, and wire types synced to API spec 1.8.0.

- `media.list()`, `pages()` and `iterate()` page through the project's media library, newest first, with `mediaType` (`image`, `video`, `audio`, `document` or `file`) and `search` filters, and `media.get(uuid)` reads one item. Rows are typed as the spec's `MediaItem` (`components['schemas']['MediaItem']`). Both need a `read_write` token on a plan with API writes: a `read` token gets 403 `TOKEN_SCOPE_READ_ONLY`, whether or not the uuid exists, and a plan without API writes 403 `FEATURE_DISABLED`. A trashed item, another project's or an unknown uuid is a 404
- **Behaviour (API, not the SDK):** a read with `status: 'draft'` from a token without the working view is now refused with 403 `TOKEN_SCOPE_READ_ONLY` (a `read` token) or `FEATURE_DISABLED` (a plan without API writes). Before API spec 1.7.0 it silently answered the published view. Code that sent `status: 'draft'` on a `read` token and used the answer as published content must drop the option
- **Behaviour (API, not the SDK):** `whoami().features.apiTokensWrite` describes the token, not the plan: `true` only for a `read_write` token on a plan with API writes, so always `false` for a `read` token. `mcpServer` and `removeBranding` still describe the plan
- `library.plan()` types `closure` as `{ atoms: string[], molecules: string[] }` and `tables` as `{ atoms, molecules }`, each `{ add, reuse, publish }`; 0.2.x typed both `Record<string, never>`
- The generated docs on `documents().update()` and `terms().update()` say that `rootAtoms`, `content` and `taxonomyTerms` replace the whole set: read the draft, merge your change and send all of it

## 0.2.1

Write bodies no longer require the fields the API defaults.

- `atoms.create()` and `.update()` may leave out `status`, `category` and `multiple`; `molecules` may leave out `status`; `doctypes` and `taxonomies` may leave out `status` and `versioningEnabled`. A create gets the default and an update keeps the current value, as before. 0.1.0 and 0.2.0 typed them as required because the generator treated a spec `default` as required; the spec itself never did

## 0.2.0

Typed list filters, the typegen CLI, and wire types synced to API spec 1.5.0.

- `npx @hypervalent-io/sdk typegen`, and `createClient({ schema })`: documents and terms read and write fields by slug with real value types, in one project
- `documents().list()`, `pages()` and `iterate()` take `sort` (`title`, `datePublished` or `dateModified`, with a leading `-` to reverse), `taxonomy` with `term` to list one term's documents, and `modifiedSince`
- `terms().list()`, `pages()` and `iterate()` take `modifiedSince`
- `modifiedSince` takes an ISO 8601 date-time with a zone, or a `Date`, which is sent as its UTC instant. It cannot report removals: a trashed or unpublished row just stops appearing
- **Breaking (types only):** read shapes type `multiple`, `locked`, `required` and `versioningEnabled` as `0 | 1`, which is what the API sends; 0.1.0 typed them `boolean`. Write bodies take either. `ReferencedImage` is now exactly the image fields, without an index signature, and a version's root atom carries its `condition`

## 0.1.0

First release.

- `createClient`, with every public API operation through `project.documents()`, `project.terms()` and the other resources, automatic pagination and media upload
- Generated wire types for the whole public API
- Safe retries, timeouts and a single `HypervalentError`
- `verifyWebhook` from `@hypervalent-io/sdk/webhooks`
- Node 22+, modern browsers, Cloudflare Workers, Deno and Bun, with no runtime dependencies
