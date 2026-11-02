# Changelog

Each release of `@hypervalent-io/sdk` has a section here, and a `vX.Y.Z` tag cannot publish without one. Before 1.0.0 a minor version may break the client's API.

## 0.1.0

First release.

- `createClient`, with every public API operation through `project.documents()`, `project.terms()` and the other resources, automatic pagination and media upload
- Generated wire types for the whole public API
- Safe retries, timeouts and a single `HypervalentError`
- `verifyWebhook` from `@hypervalent-io/sdk/webhooks`
- Node 22+, modern browsers, Cloudflare Workers, Deno and Bun, with no runtime dependencies
