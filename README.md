# Hypervalent SDK for TypeScript

TypeScript client for the Hypervalent public API. Node 22+, modern browsers, Cloudflare Workers, Deno and Bun, with zero runtime dependencies.

> **Status: early scaffold.** The package currently ships the generated API types and is not yet published to npm. The client follows.

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
| `npm test` | Vitest |
| `npm run smoke` | Imports the built package in Node, as ESM and CJS |
| `npm run check:workers` | Bundles the built package for Workers, failing on any Node built-in |
| `npm run spec:drift` | Compares `openapi.json` with the published spec |
| `npm run spec:sync` | Replaces `openapi.json` with the published spec and regenerates |

## API spec

`openapi.json` is a vendored copy of [the published spec](https://docs.hypervalent.io/openapi.json). Never edit it or `src/generated/` by hand. A scheduled workflow fails when the copy falls behind; `npm run spec:sync` brings it up to date.

## License

[MIT](LICENSE)
