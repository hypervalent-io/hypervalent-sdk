# Changelog

Each release of `@hypervalent-io/sdk` has a section here, and a `vX.Y.Z` tag cannot publish without one. Before 1.0.0 a minor version may break the client's API.

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
