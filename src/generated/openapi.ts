// GENERATED from openapi.json by scripts/generate.mjs. Do not edit by hand:
// run `npm run generate`. `npm run check` fails when this file differs.

export interface paths {
    "/orgs/{org_id}/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List reachable projects
         * @description The projects this token can reach: every live project for an organization-wide token; exactly its own for a project-narrowed one. The only way an organization-wide token discovers project slugs.
         */
        get: operations["listProjects"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/atoms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List atoms (field definitions)
         * @description Every published atom. Root-atom values and content nodes reference atoms by `uuid`; this list is how a consumer resolves them to a field definition.
         */
        get: operations["listAtoms"];
        put?: never;
        /**
         * Create an atom
         * @description Create a field definition. `fieldType`, `category`, `fieldConfig` (only the keys the field type reads) and `defaultValue` (a value of the field's own shape) are checked before anything is written — every problem at once, as 422 with `issues`. A draft by default: pass `status: published` to bind it into a molecule or document type straight away. Answers the public atom shape plus `status`.
         */
        post: operations["createAtom"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/atoms/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get an atom */
        get: operations["getAtom"];
        put?: never;
        /**
         * Edit an atom
         * @description Edit an atom in the working view (draft or published; trashed is a 404). Every key of `AtomWrite` is optional and an omitted key is left alone; the checks run against the atom as it will be, so a new `fieldType` re-checks the stored `fieldConfig` and `defaultValue` (resend them when they no longer fit; `defaultValue: null` clears it). While the atom is bound in a molecule, document type or taxonomy its `fieldType` and `multiple` cannot change, and `status: draft` is 409 `CANNOT_DRAFT_IN_USE`.
         */
        post: operations["updateAtom"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/design-token-schemes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List design token schemes
         * @description Every published scheme (e.g. light / dark). A token's missing scheme value inherits from the scheme's `baseSchemeSlug`.
         */
        get: operations["listDesignTokenSchemes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/design-token-theme": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the design theme
         * @description The generator input the palettes and color roles are built from: the source color, the M3 scheme variant and the optional secondary / tertiary / neutral key colors, plus the variants a theme may name.
         */
        get: operations["getDesignTheme"];
        put?: never;
        /**
         * Save the design theme and regenerate
         * @description Save any of the theme's keys (a key color sent as `null` or `""` is cleared, and the variant then derives that palette from the source) and regenerate every palette and color role from it. Color tokens with `valueSource: manual` keep their values.
         */
        post: operations["updateDesignTheme"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/design-tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List design tokens
         * @description Every published design token, with each scheme value expanded (colors into hex / rgb / hsl forms). `status=draft` (a `read_write` token on a plan with API writes) adds the draft rows — the unpublished component tokens — each carrying its `status`.
         */
        get: operations["listDesignTokens"];
        put?: never;
        /**
         * Edit design tokens
         * @description Edit up to 200 EXISTING tokens by slug in one transaction — tokens are never created or trashed through the API. `schemeValues` keys replace the stored ones and the rest are kept: a color role is keyed by scheme slug (hex values), a palette by tone, every other type by `default` — a CSS string, a typography composite (merged by property; `fontFamily` names a font-family set), or a component's `{ ref: '<group>.<token>' }` / `{ value }`. A color edit stamps `valueSource: manual` so regeneration keeps it; `valueSource: generated` hands the color back to the generator and regenerates. `status` moves a token between `draft` and `published` (publishing a component's tokens adds it to the export). Every problem is reported at once as 422 with `issues`; nothing is written until all pass.
         */
        post: operations["updateDesignTokens"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/design-tokens.css": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * CSS custom-property export
         * @description A stylesheet of custom properties per scheme (Material 3 roles), ready to link from a site. Errors from this raw export use the nested `{ error }` envelope; an unknown org or project answers a `text/plain` CSS comment.
         */
        get: operations["getDesignTokensCss"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/design-tokens.tokens.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * W3C tokens.json export
         * @description The published tokens in the W3C Design Tokens JSON format. Errors from this raw export use the nested `{ error }` envelope; an unknown org or project answers `{ "error": "Not found" }`.
         */
        get: operations["getDesignTokensW3C"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/doctypes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List document types
         * @description Every published document type with its published-document count, root-atom bindings (`atoms`), offered `taxonomies` and supported molecule uuids (`supports`).
         */
        get: operations["listDocumentTypes"];
        put?: never;
        /**
         * Create a document type
         * @description Create a content blueprint: root atom bindings, the molecules its content tree may hold at the top level, the taxonomies it offers and its preset tree — every reference a published row of this project, checked before anything is written. The plan's document-type cap applies (403 `LIMIT_EXCEEDED`). A draft by default; documents can be created under a draft document type, but only a published one is served by the reads.
         */
        post: operations["createDocumentType"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/doctypes/{doctypeSlug}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List documents of a type
         * @description One page of the document type's published documents, each with its active version's content and projected root atoms inline. The page's referenced images ship once in `referencedImages`, and the files and videos its file and video fields reference once in `referencedFiles`.
         */
        get: operations["listDocuments"];
        put?: never;
        /**
         * Create a draft document
         * @description Create a draft document and its first version. The payload is validated against the document type before any write (422 with a per-field `fields` map). Content goes through the editor's own save path, so the write has exactly the guards the editor has. Answers the working view of the new document — the same body `GET …/documents/{slug}?status=draft` serves.
         */
        post: operations["createDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/doctypes/{doctypeSlug}/documents/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a document
         * @description One document with its version, tagged taxonomy terms (with their content) and referenced images. Anything not published — or not existing — is a plain 404 to a read token.
         */
        get: operations["getDocument"];
        put?: never;
        /**
         * Edit a document
         * @description Edit the working document (draft or published; a trashed document is a 404). `content` / `rootAtoms` / `taxonomyTerms` land on the working version FIRST — an editor holding a fresh checkout refuses the whole save with 409 `VERSION_LOCKED` and nothing is written — then `title` / `description` / `slug` land on the row. Editing a published version with versioning on forks a new draft, as the editor would. **Each of `content`, `rootAtoms` and `taxonomyTerms` that is sent REPLACES the stored value whole; nothing is merged.** A root atom left out of `rootAtoms` is cleared (it reads back with its binding's default), a block left out of `content` is removed, and a term left out of `taxonomyTerms` is untagged. A key the body omits entirely leaves that value as it was, and `title`, `description` and `slug` are each edited on their own. To change some fields and keep the rest, read the working view (`GET …/documents/{slug}?status=draft`), merge your changes into its `rootAtoms` (an array there: send it back as an object keyed by atom `uuid`), `content` or tags, and send the whole set.
         */
        post: operations["updateDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/doctypes/{doctypeSlug}/documents/{slug}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Publish a document
         * @description Make the working version live — **visible on the public read API and therefore on the customer's site at once**. Idempotent: an already-published working version is left alone. Lock-checked like any save.
         */
        post: operations["publishDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/doctypes/{doctypeSlug}/documents/{slug}/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trash a document
         * @description Soft-trash the document. The slug is rewritten to `<slug>-trashed-<uuid>` so the original is free again. There is no purge and no restore through the public surface — an admin restores from Studio.
         */
        post: operations["trashDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/doctypes/{doctypeSlug}/documents/{slug}/unpublish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Unpublish a document
         * @description Move the document row back to draft. Published versions are immutable and stay in the history.
         */
        post: operations["unpublishDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/doctypes/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a document type
         * @description One published document type — the authoring schema a write payload is validated against.
         */
        get: operations["getDocumentType"];
        put?: never;
        /**
         * Edit a document type
         * @description Edit a document type in the working view. Every key of `DocumentTypeWrite` is optional; `atoms`, `supports`, `taxonomies` and `content` each REPLACE the stored list or tree when sent. Existing documents keep their stored values; a root atom removed from `atoms` drops out of their reads. Unpublishing a document type that documents use is 409 `CANNOT_DRAFT_IN_USE`. Answers the working-view read.
         */
        post: operations["updateDocumentType"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/library": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List the atom & molecule library
         * @description The platform's catalogue of ready-made atoms and molecules, which any project can insert. It is the same for every project and says nothing about what a project already holds: compare slugs with `/atoms` and `/molecules`, or call `/library/plan`. Strings are `en-US`.
         */
        get: operations["listLibrary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/library/insert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Insert library items
         * @description Insert items and their whole dependency closure in one all-or-nothing transaction. **Inserted rows are published immediately**, so they can be bound at once. A slug the project already has is reused and never overwritten; a matching draft is published in place. Calling it again changes nothing. Unknown items are 404 `LIBRARY_ITEM_NOT_FOUND`, a malformed list 400 `LIBRARY_ITEMS_INVALID`.
         */
        post: operations["insertLibraryItems"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/library/plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Plan a library insert
         * @description A dry run of `POST …/library/insert` against this project; writes nothing. Lists every row of the dependency closure with what the insert would do to it: `add`, `reuse` (the slug exists and the project's definition wins) or `publish` (the slug exists as a draft and would be published in place). A `publish` row has no `uuid` unless the token can read drafts. Unknown items are 404 `LIBRARY_ITEM_NOT_FOUND`, a malformed list 400 `LIBRARY_ITEMS_INVALID`.
         */
        get: operations["planLibraryInsert"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List media
         * @description One page of the project's media library — images, files and videos, newest first (`dateCreated`, then a stable tie-break, so offset paging neither skips nor repeats a row). Trashed items are left out. **Needs a `read_write` token on a plan with API writes**, like `status=draft`: the library holds assets for unpublished work, so a `read` token is refused (403 `TOKEN_SCOPE_READ_ONLY`). A published content read already lists the media it uses in `referencedImages` / `referencedFiles`.
         */
        get: operations["listMedia"];
        put?: never;
        /**
         * Upload an image, file or video
         * @description Upload one or more images, files or videos as `multipart/form-data` (`file` / `files` + `title` / `alt`), or one by public URL as JSON `{ url }` fetched server-side. Same ingest pipeline as Studio: content sniffing, a type allow-list (by default JPEG, PNG, WebP, GIF, AVIF and SVG images, PDF, Word, Excel and PowerPoint documents, zip, CSV and plain text, and MP4, WebM and MOV videos), SVG sanitizing, sha256 de-duplication, the plan's storage cap (403 `LIMIT_EXCEEDED`) and async thumbnails for images (files and videos have none, and no `width` / `height`). Per-file size caps, by default 20 MiB for images and files and 30 MiB for videos; a file over its cap is 413 `FILE_TOO_LARGE`. Use the returned `uuid` in an image field (images only), a file field, or a video field (videos only).
         */
        post: operations["uploadMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/media/{uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a media item
         * @description One item of the project's media library by `uuid`. A trashed item, another project's and an unknown `uuid` are all 404. **Needs a `read_write` token on a plan with API writes**; a `read` token gets the same 403 `TOKEN_SCOPE_READ_ONLY` whether or not the `uuid` exists.
         */
        get: operations["getMedia"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/molecules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List molecules (reusable blocks) */
        get: operations["listMolecules"];
        put?: never;
        /**
         * Create a molecule
         * @description Create a reusable block: its atom bindings (published atoms of this project, each once, with typed defaults and sibling visibility conditions), the published molecules it may nest (`supports`) and its preset tree (`content`). Checked against the project's published structure before anything is written. A draft by default. Answers the public molecule shape plus `status`.
         */
        post: operations["createMolecule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/molecules/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a molecule */
        get: operations["getMolecule"];
        put?: never;
        /**
         * Edit a molecule
         * @description Edit a molecule in the working view. Every key of `MoleculeWrite` is optional; `atoms`, `supports` and `content` each REPLACE the stored list or tree when sent (read it with `?status=draft` first) and are left alone when omitted. A `supports` change re-checks the stored preset tree. Unpublishing a molecule another structure supports is 409 `CANNOT_DRAFT_IN_USE`.
         */
        post: operations["updateMolecule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List settings
         * @description Every published General Setting with its configured value under `value`.
         */
        get: operations["listSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/settings/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a setting
         * @description One published setting by slug — the read for a single configured value such as `site-title`.
         */
        get: operations["getSetting"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/taxonomies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List taxonomies
         * @description Every published taxonomy with its published-term count, root-atom bindings and the document types that offer it. `?status=draft` lists draft taxonomies too, each with its preset `content`.
         */
        get: operations["listTaxonomies"];
        put?: never;
        /**
         * Create a taxonomy
         * @description Create a taxonomy — the term blueprint: root atom bindings, the molecules a term's content tree may hold at the top level and its preset tree, every reference a published row of this project, checked before anything is written (422 with `issues`). The plan's taxonomy cap applies (403 `LIMIT_EXCEEDED`). A draft by default; terms can be created under a draft taxonomy, but a document type can only offer a published one.
         */
        post: operations["createTaxonomy"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/taxonomies/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a taxonomy with a page of its terms
         * @description The taxonomy plus one page of its terms, each with its active version's content inline. `modifiedSince` narrows the terms and their `count`, while the taxonomy's `termCount` stays its total.
         */
        get: operations["getTaxonomy"];
        put?: never;
        /**
         * Edit a taxonomy
         * @description Edit a taxonomy in the working view. Every key of `TaxonomyWrite` is optional; `atoms`, `supports` and `content` each REPLACE the stored list or tree when sent (read it with `?status=draft` first). Existing terms keep their stored values. Unpublishing a taxonomy a document type offers or that has live terms is 409 `CANNOT_DRAFT_IN_USE`. Answers the working-view read.
         */
        post: operations["updateTaxonomy"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/taxonomies/{taxonomySlug}/terms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a draft term
         * @description Create a draft term and its first version under the taxonomy. `parentSlug` must name a live term of the SAME taxonomy. Answers the working view of the new term.
         */
        post: operations["createTerm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/taxonomies/{taxonomySlug}/terms/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a term
         * @description One term with its active version, hydrated like a document. `version` is `null` for a published term that never had a published version.
         */
        get: operations["getTerm"];
        put?: never;
        /**
         * Edit a term
         * @description Edit the working term: content first (lock check on), then the row — including `parentSlug` (`null` = top level; never itself). **`content` and `rootAtoms`, when sent, each REPLACE the stored value whole; nothing is merged.** A root atom left out of `rootAtoms` is cleared (it reads back with its binding's default) and a block left out of `content` is removed. A key the body omits entirely leaves that value as it was. To change some fields and keep the rest, read the working view (`GET …/terms/{slug}?status=draft`), merge your changes into its `rootAtoms` (an array there: send it back as an object keyed by atom `uuid`) or `content`, and send the whole set.
         */
        post: operations["updateTerm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/taxonomies/{taxonomySlug}/terms/{slug}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Publish a term
         * @description Make the working version live and the term row published — **visible on the public read API, and in every published document tagged with it, at once**. Idempotent: an already-published working version is left alone. Lock-checked like any save. A term with no version publishes its row alone.
         */
        post: operations["publishTerm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/taxonomies/{taxonomySlug}/terms/{slug}/trash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trash a term
         * @description Soft-trash the term. The slug is rewritten to `<slug>-trashed-<uuid>` so the original is free again. A term any document is tagged with is 409 `CANNOT_TRASH_IN_USE`. No purge and no restore through the public surface — an admin restores from Studio.
         */
        post: operations["trashTerm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/projects/{projectSlug}/taxonomies/{taxonomySlug}/terms/{slug}/unpublish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Unpublish a term
         * @description Move the term row back to draft. A term any document is tagged with is 409 `CANNOT_DRAFT_IN_USE`.
         */
        post: operations["unpublishTerm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orgs/{org_id}/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Who am I
         * @description The presented token's scope, project narrowing, expiry and the public feature trio. A project-narrowed token is a valid caller here (there is no path project to mismatch) and is confined instead.
         */
        get: operations["getToken"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Who am I (no organization)
         * @description The same answer as `GET /orgs/{org_id}/token` plus the organization the token belongs to — for a caller that does not know its organization yet (an MCP client connected by OAuth login). There is no path organization to cross-check; the token's own organization is used.
         */
        get: operations["getTokenOrgless"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description The flat error envelope handlers answer with (`src/errors/error-handler.js`). `message` is localized; `code` is the stable key to branch on. */
        Error: {
            status: number;
            code: string;
            message: string;
            /** @description Set (with `upgrade: true`) when a plan upgrade would unlock the call. */
            requiredPlan?: string;
            upgrade?: boolean;
            /** @description The entitlement slug a `FEATURE_DISABLED` refusal names. */
            feature?: string;
            /** @description On `VALIDATION_ERROR` (422): one message per refused field, keyed by the field name as sent. */
            fields?: {
                [key: string]: string;
            };
            /** @description On `VERSION_LOCKED` (409): the display name of the editor holding the checkout — never their email or id. */
            holder?: {
                name?: string;
            };
            /**
             * Format: date-time
             * @description On `VERSION_LOCKED`: when the editor lock lapses.
             */
            expiresAt?: string;
            /** @description On a structure create's `VALIDATION_ERROR` (atoms, molecules, document types): every refusal with its exact path (`atoms[2].condition.when`, `content[0].children[1].uuid`). `fields` then carries the same messages under the top-level body key. */
            issues?: {
                path: string;
                message: string;
            }[];
        };
        /** @description The nested shape middleware answers with — the token authenticator (401 `INVALID_API_TOKEN`, 403 `TOKEN_SCOPE_READ_ONLY`) and the raw design-token exports. Same fields as `Error`, one level down. */
        ErrorEnvelope: {
            error: components["schemas"]["Error"];
        };
        /** @description GET /orgs/{org_id}/token — `shapePublicToken` + `shapePublicFeatures` (`routes/public-org.js`, `routes/public-api.js`). */
        TokenWhoami: {
            token: {
                /** @description The 12-character display prefix — the only credential fragment that ever appears in a body. */
                prefix: string;
                title: string;
                /** @enum {string} */
                scope: "read" | "read_write";
                /**
                 * Format: uuid
                 * @description `null` for an organization-wide token.
                 */
                projectUuid: string | null;
                /** @description `null` for an organization-wide token, or for a narrowed token whose project was deleted. */
                projectSlug: string | null;
                /** Format: date-time */
                expiresAt: string | null;
            };
            /** @description The fixed public feature trio — never the organization's whole entitlement map. */
            features: {
                mcpServer: boolean;
                /** @description Whether this token may write today: `true` only when its scope is `read_write` AND the plan allows API writes, so a `read` token always answers `false`. The other two flags describe the plan. */
                apiTokensWrite: boolean;
                removeBranding: boolean;
            };
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description GET /token (CMS-687) — the TokenWhoami body plus the token's own organization (`routes/public-org.js`). */
        TokenWhoamiOrgless: {
            token: {
                /** @description The 12-character display prefix — the only credential fragment that ever appears in a body. */
                prefix: string;
                title: string;
                /** @enum {string} */
                scope: "read" | "read_write";
                /**
                 * Format: uuid
                 * @description `null` for an organization-wide token.
                 */
                projectUuid: string | null;
                /** @description `null` for an organization-wide token, or for a narrowed token whose project was deleted. */
                projectSlug: string | null;
                /** Format: date-time */
                expiresAt: string | null;
            };
            org: {
                /** Format: uuid */
                uuid: string;
                /** @description The organization id used in `/orgs/{org_id}/…` paths. */
                slug: string | null;
                title: string | null;
            };
            /** @description The fixed public feature trio — never the organization's whole entitlement map. */
            features: {
                mcpServer: boolean;
                /** @description Whether this token may write today: `true` only when its scope is `read_write` AND the plan allows API writes, so a `read` token always answers `false`. The other two flags describe the plan. */
                apiTokensWrite: boolean;
                removeBranding: boolean;
            };
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description `shapePublicProject` (`routes/public-org.js`). */
        Project: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
        };
        /** @description GET /orgs/{org_id}/projects — every live project for an organization-wide token; exactly its own for a project-narrowed one. */
        ProjectList: {
            results: components["schemas"]["Project"][];
            /** @description The TOTAL number of rows, not the page size. */
            count: number;
            /** @description The effective page size after clamping to the server maximum (50). */
            limit: number;
            offset: number;
            /** @description 1-based page number. */
            page: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description A field definition — `shapePublicAtom` (`routes/atomic-atoms.js`). `uuid` is the key a version's `rootAtoms` and content nodes reference the atom by. The working view (`?status=draft`) adds `status`. */
        Atom: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description: string | null;
            icon: string | null;
            category: string | null;
            /** @description The editor field type (e.g. `text`, `textarea`, `image`, `select`). */
            fieldType: string;
            /** @description Per-field-type options (choices, limits, …). */
            fieldConfig: {
                [key: string]: unknown;
            } | null;
            /**
             * @description `1` when the field holds an array of values.
             * @enum {integer}
             */
            multiple: 0 | 1;
            /** @description Any JSON value. */
            defaultValue: unknown;
        };
        /** @description GET …/atoms — every published atom in the project. */
        AtomList: {
            results: components["schemas"]["Atom"][];
            /** @description Equal to `results.length` — the list is never paginated. */
            count: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        AtomRead: {
            atom: components["schemas"]["Atom"];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description A reusable content block — `shapePublicMolecule` (`routes/molecules.js`). The working view (`?status=draft`) adds `status`. */
        Molecule: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description: string | null;
            icon: string | null;
            /** @description The molecule's content tree (nodes keyed by atom slug/uuid). */
            content: unknown[] | Record<string, never> | null;
            /** @description The atoms an instance of this molecule carries, in editor order — a content node's `atoms` map is keyed by these atoms' slugs. */
            atoms: components["schemas"]["RootAtomBinding"][];
            /** @description Uuids of the molecules that may nest inside this one (a node's `children`) — resolve against `/molecules`. */
            supports: string[];
        };
        /** @description A catalogue atom — `atomItem` (`library/index.js`). */
        LibraryAtom: {
            /** @enum {string} */
            kind: "atom";
            slug: string;
            title: string;
            description: string;
            icon: string | null;
            category: string;
            fieldType: string;
            /** @enum {integer} */
            multiple: 0 | 1;
        };
        /** @description A catalogue molecule — `moleculeItem` (`library/index.js`). */
        LibraryMolecule: {
            /** @enum {string} */
            kind: "molecule";
            slug: string;
            title: string;
            description: string;
            icon: string | null;
            group: string;
            groupTitle: string;
            /** @description The atoms it binds, in editor order. */
            atoms: (components["schemas"]["LibraryAtom"] & {
                required: boolean;
                locked: boolean;
            })[];
            /** @description Slugs of the molecules that may nest inside it. */
            supports: string[];
            /** @description The full closure an insert brings in, minus the molecule itself. */
            dependencies: components["schemas"]["LibraryItemRef"][];
        };
        LibraryItemRef: {
            /** @enum {string} */
            kind: "atom" | "molecule";
            slug: string;
        };
        /** @description GET …/library — `listLibrary` (`library/index.js`). */
        LibraryCatalogue: {
            version: number;
            locale: string;
            groups: {
                slug: string;
                title: string;
            }[];
            atoms: components["schemas"]["LibraryAtom"][];
            molecules: components["schemas"]["LibraryMolecule"][];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        LibraryPlanRow: {
            /** @enum {string} */
            kind: "atom" | "molecule";
            slug: string;
            /** @enum {string} */
            action: "add" | "reuse" | "publish";
            /**
             * Format: uuid
             * @description The target row. Absent from a plan's `add` rows (the row does not exist yet) and from its `publish` rows when the token cannot read drafts.
             */
            uuid?: string;
        };
        /** @description The plan (GET …/library/plan) or the result (POST …/library/insert) — `shapeResult` (`atom-library-service.js`). */
        LibraryPlan: {
            dryRun: boolean;
            applied: boolean;
            /** @description Every row of the closure, atoms first. */
            rows: components["schemas"]["LibraryPlanRow"][];
            /** @description How many rows of each kind take each action. Every count is present, 0 included. */
            tables: {
                atoms: {
                    add: number;
                    reuse: number;
                    publish: number;
                };
                molecules: {
                    add: number;
                    reuse: number;
                    publish: number;
                };
            };
            /** @description Every slug involved, the requested items and their dependencies — `resolveClosure` (`library/index.js`). `molecules` is in dependency order (a supported child before its parent); `atoms` in the order they were reached. A kind with none is an empty array. */
            closure: {
                atoms: string[];
                molecules: string[];
            };
            inserted: components["schemas"]["LibraryPlanRow"][];
            reused: components["schemas"]["LibraryPlanRow"][];
            published: components["schemas"]["LibraryPlanRow"][];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        LibraryInsert: {
            items: components["schemas"]["LibraryItemRef"][];
        };
        /** @description GET …/molecules — every published molecule in the project. */
        MoleculeList: {
            results: components["schemas"]["Molecule"][];
            /** @description Equal to `results.length` — the list is never paginated. */
            count: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        MoleculeRead: {
            molecule: components["schemas"]["Molecule"];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description An atom binding on a document type, taxonomy (its root atoms) or molecule, in editor order (`rootAtomBindingsColumn`, `queries/helpers/structure-aggregates.js`). Resolve `uuid` against `/atoms`. */
        RootAtomBinding: {
            /** Format: uuid */
            uuid: string;
            /** @description Any JSON value. */
            defaultValue: unknown;
            /** @enum {integer} */
            locked: 0 | 1;
            /** @enum {integer} */
            required: 0 | 1;
            /** @description Visibility condition, when one is set. */
            condition?: Record<string, never> | string | null;
        };
        TaxonomySummary: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            titlePlural: string | null;
            icon: string | null;
        };
        DocumentTypeSummary: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            titlePlural: string | null;
            icon: string | null;
        };
        /** @description `shapePublicDocumentType` (`services/public-doctype-service.js`). The preset editor content tree is deliberately not served. */
        DocumentType: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            titlePlural: string | null;
            description: string | null;
            icon: string | null;
            /**
             * @description `published`, or `draft` in the working view (`?status=draft`).
             * @enum {string}
             */
            status: "draft" | "published";
            /** @enum {integer} */
            versioningEnabled: 0 | 1;
            /** Format: date-time */
            dateCreated: string;
            /** Format: date-time */
            dateModified: string;
            /** @description The preset tree — served in the working view only (`?status=draft`), for an author about to replace it. */
            content?: unknown[] | null;
            atoms: components["schemas"]["RootAtomBinding"][];
            /** @description Uuids of the molecules a document of this type may nest — resolve against `/molecules`. */
            supports: string[];
            /** @description Published documents of this type. */
            documentCount: number;
            /** @description The taxonomies this document type offers. */
            taxonomies: components["schemas"]["TaxonomySummary"][];
        };
        /** @description GET …/doctypes — every published document type in the project. */
        DocumentTypeList: {
            results: components["schemas"]["DocumentType"][];
            /** @description Equal to `results.length` — the list is never paginated. */
            count: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        DocumentTypeRead: {
            documentType: components["schemas"]["DocumentType"];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description One atom bound into a molecule or document type, in editor order. */
        AtomBindingWrite: {
            /**
             * Format: uuid
             * @description A published atom of this project (`GET …/atoms`). Each atom once.
             */
            uuid: string;
            /** @description This binding's default — a value of the atom's own field shape (see `AtomWrite.defaultValue`). */
            defaultValue?: unknown;
            /** @enum {boolean|integer} */
            locked?: true | false | 0 | 1;
            /** @enum {boolean|integer} */
            required?: true | false | 0 | 1;
            /** @description Show this field only while a sibling binding matches: `{ when: <uuid of another atom in this list>, operator: equals | notEquals | isEmpty | isNotEmpty, value? }` (`value` required for equals / notEquals). */
            condition?: {
                /** Format: uuid */
                when?: string;
                /** @enum {string} */
                operator?: "equals" | "notEquals" | "isEmpty" | "isNotEmpty";
                value?: unknown;
            } | null;
        };
        /** @description A molecule instance in a preset content tree. Every node is given a fresh `key`. */
        PresetNode: {
            /**
             * Format: uuid
             * @description The molecule TEMPLATE uuid — at the top a molecule the parent `supports`, below a node a molecule its molecule supports.
             */
            uuid: string;
            /** @description Values keyed by the molecule's bound atom SLUGS. */
            atoms?: {
                [key: string]: unknown;
            };
            /** @description Nested nodes, same shape. */
            children?: {
                [key: string]: unknown;
            }[];
        };
        AtomWrite: {
            title: string;
            /** @description Omit to derive a unique slug from the title. Supplied, it is used as-is — a collision is a 409 `SLUG_CONFLICT`. */
            slug?: string;
            description?: string;
            /** @description A Material Design Icons name. */
            icon?: string;
            /**
             * @description Only a published atom can be bound into a molecule or document type.
             * @default draft
             * @enum {string}
             */
            status?: "draft" | "published";
            /** @enum {string} */
            fieldType: "text" | "textarea" | "html" | "markdown" | "number" | "color" | "image" | "select" | "range" | "spacing" | "date" | "boolean" | "icon" | "link" | "video" | "file" | "email" | "tel" | "slug";
            /**
             * @description Editor layout: `style` atoms edit in the right rail, `content` / `media` in the canvas.
             * @default content
             * @enum {string}
             */
            category?: "style" | "content" | "media";
            /**
             * @description An array of values instead of one.
             * @default false
             * @enum {boolean|integer}
             */
            multiple?: true | false | 0 | 1;
            /** @description Only the keys the field type reads: select `options` (required — `[{ value, text?, selected? }]` or strings); number / range `min`, `max`, `step`; html `toolbar` (the toolbar switches, `headings: [1–6]`); image `dragDropEnabled`; image / file / video `maxFileSizeBytes`. Any other key is refused. */
            fieldConfig?: {
                [key: string]: unknown;
            };
            /** @description A value of the field's shape: a string for text-like types (a safe link for `link`); a number for number / range, within `min` / `max`; a boolean; one of the option values for select; `{ top?, right?, bottom?, left? }` numbers for spacing; an array of media uuids (or video URLs) for image / file / video. An array of those when `multiple`. */
            defaultValue?: unknown;
        };
        MoleculeWrite: {
            title: string;
            /** @description Omit to derive a unique slug from the title. */
            slug?: string;
            description?: string;
            icon?: string;
            /**
             * @description Only a published molecule can be supported by another molecule or a document type.
             * @default draft
             * @enum {string}
             */
            status?: "draft" | "published";
            atoms?: components["schemas"]["AtomBindingWrite"][];
            /** @description Published molecules of this project that may nest inside this one. */
            supports?: string[];
            /** @description The preset tree a fresh use of this molecule starts from — top-level nodes must be molecules in `supports`. */
            content?: components["schemas"]["PresetNode"][];
        };
        DocumentTypeWrite: {
            title: string;
            titlePlural?: string;
            /** @description Omit to derive a unique slug from the title. */
            slug?: string;
            description?: string;
            icon?: string;
            /**
             * @description Never `trashed` on the public surface — a trashed row is a plain 404.
             * @default draft
             * @enum {string}
             */
            status?: "draft" | "published";
            /**
             * @description Keep a version history (fork on publish).
             * @default true
             * @enum {boolean|integer}
             */
            versioningEnabled?: true | false | 0 | 1;
            /** @description The root atoms (top-level fields) of a document of this type. */
            atoms?: components["schemas"]["AtomBindingWrite"][];
            /** @description Published molecules a document's content tree may hold at the top level. */
            supports?: string[];
            /** @description Published taxonomies of this project a document may be tagged in. */
            taxonomies?: string[];
            /** @description The preset tree every new document starts from — top-level nodes must be molecules in `supports`. */
            content?: components["schemas"]["PresetNode"][];
        };
        AtomCreated: {
            atom: components["schemas"]["Atom"] & {
                /**
                 * @description Never `trashed` on the public surface — a trashed row is a plain 404.
                 * @enum {string}
                 */
                status: "draft" | "published";
            };
        };
        MoleculeCreated: {
            molecule: components["schemas"]["Molecule"] & {
                /**
                 * @description Never `trashed` on the public surface — a trashed row is a plain 404.
                 * @enum {string}
                 */
                status: "draft" | "published";
            };
        };
        /** @description The document type as the working-view read (`GET …/doctypes/{slug}?status=draft`) serves it. */
        DocumentTypeCreated: {
            documentType: components["schemas"]["DocumentType"];
        };
        /** @description `shapePublicSetting` (`routes/settings.js`) — an admin-defined config field with its configured value. */
        Setting: {
            slug: string;
            title: string;
            description: string | null;
            fieldType: string;
            /** @enum {integer} */
            multiple: 0 | 1;
            /** @description The configured value — any JSON value, `null` when unset. */
            value: unknown;
        };
        /** @description GET …/settings — every published setting in the project. */
        SettingList: {
            results: components["schemas"]["Setting"][];
            /** @description Equal to `results.length` — the list is never paginated. */
            count: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        SettingRead: {
            setting: components["schemas"]["Setting"];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description A `color` token value expanded into every common format (`expandColor`, `requests/utilities/cast-design-token-results.js`). */
        ColorValue: {
            /** @example #6750A4 */
            hex: string;
            /** @example #6750A4FF */
            hexa: string;
            /** @example rgb(103, 80, 164) */
            rgb: string;
            /** @example rgba(103, 80, 164, 1) */
            rgba: string;
            /** @example hsl(256, 34%, 48%) */
            hsl: string;
            /** @example hsla(256, 34%, 48%, 1) */
            hsla: string;
            components: {
                r: number;
                g: number;
                b: number;
                a: number;
            };
        };
        /** @description A published design token row (`design_tokens`, cast by `castDesignTokenRow`). `schemeValues` maps scheme slug → value: a `ColorValue` for `color` tokens, the stored value verbatim for other token types; `schemeValuesRaw` keeps the stored strings. */
        DesignToken: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description?: string | null;
            icon?: string | null;
            /**
             * @description `draft` only in the `status=draft` working view.
             * @enum {string}
             */
            status: "published" | "draft";
            sortOrder?: number | null;
            /** @description `color`, `typography`, `radius`, `elevation`, `state`, `motion`, `font-family` or `component`. */
            designTokenType: string;
            tokenCategory?: string | null;
            materialRole?: string | null;
            component?: string | null;
            componentCategory?: string | null;
            valueSource?: string | null;
            schemeValues: {
                [key: string]: components["schemas"]["ColorValue"] | string | {
                    [key: string]: unknown;
                } | null;
            };
            schemeValuesRaw: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            dateCreated?: string;
            /** Format: date-time */
            dateModified?: string;
        } & {
            [key: string]: unknown;
        };
        DesignTokenEdits: {
            tokens: {
                /** @description An existing token of this project. */
                slug: string;
                /** @description Merged into the stored map: scheme slug → hex (color roles), tone → hex (palettes), or `default` → the value (every other type). */
                schemeValues?: {
                    [key: string]: unknown;
                };
                /** @enum {string} */
                status?: "draft" | "published";
                /**
                 * @description Color tokens only. `generated` regenerates the color from the theme.
                 * @enum {string}
                 */
                valueSource?: "generated" | "manual";
            }[];
        };
        DesignTokenEditResult: {
            /** @description The changed tokens as stored now. */
            tokens: ({
                slug?: string;
                title?: string;
                designTokenType?: string;
                component?: string;
                /** @enum {string} */
                status?: "draft" | "published";
                /** @enum {string} */
                valueSource?: "generated" | "manual";
                schemeValues?: {
                    [key: string]: unknown;
                };
            } & {
                [key: string]: unknown;
            })[];
            updated: number;
            /** @description Entries that matched what was stored. */
            unchanged: number;
            /** @description Present when a color was handed back to the generator. */
            regenerated?: {
                generated?: number;
                skipped?: number;
            };
        } & {
            [key: string]: unknown;
        };
        DesignTheme: {
            /** @description #RRGGBB — what every palette is generated from. */
            sourceColor?: string | null;
            /** @description The M3 scheme variant (`tonalSpot`, `vibrant`, …). */
            variant?: string;
            secondaryColor?: string | null;
            tertiaryColor?: string | null;
            neutralColor?: string | null;
        };
        DesignThemeRead: {
            theme: components["schemas"]["DesignTheme"];
            variants: string[];
        } & {
            [key: string]: unknown;
        };
        DesignThemeWrite: {
            /** @description #RRGGBB. */
            sourceColor?: string;
            variant?: string;
            /** @description #RRGGBB, or null / "" to clear. */
            secondaryColor?: string | null;
            tertiaryColor?: string | null;
            neutralColor?: string | null;
        };
        DesignThemeResult: {
            theme: components["schemas"]["DesignTheme"];
            /** @description Palette and color-role tokens written. */
            generated: number;
            /** @description Manual color overrides left alone. */
            skipped: number;
        } & {
            [key: string]: unknown;
        };
        /** @description GET …/design-tokens — every published token, optionally filtered by `?token_type=`. */
        DesignTokenList: {
            results: components["schemas"]["DesignToken"][];
            /** @description Equal to `results.length` — the list is never paginated. */
            count: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description A published design token scheme row (`design_token_schemes`). A missing key in a token's `schemeValues` inherits from `baseSchemeSlug`. */
        DesignTokenScheme: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description?: string | null;
            icon?: string | null;
            /** @enum {string} */
            status: "published";
            sortOrder?: number | null;
            designTokenType: string;
            baseSchemeSlug?: string | null;
            /** @description `light` / `dark` for color schemes. */
            mode?: string | null;
            contrastLevel?: string | number | null;
            /** Format: date-time */
            dateCreated?: string;
            /** Format: date-time */
            dateModified?: string;
        } & {
            [key: string]: unknown;
        };
        /** @description GET …/design-token-schemes — every published scheme. */
        DesignTokenSchemeList: {
            results: components["schemas"]["DesignTokenScheme"][];
            /** @description Equal to `results.length` — the list is never paginated. */
            count: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description The W3C Design Tokens Community Group JSON (`toW3CTokens`, `services/design-token-export.js`): nested groups of `{ $type, $value }` leaves. Organizations without `removeBranding` carry the stamp in the top-level `$description`. */
        W3CDesignTokens: {
            $description?: string;
        } & {
            [key: string]: unknown;
        };
        /** @description The ten-field public version envelope shared by documents and terms — `shapePublicVersion` (`services/public-read-helpers.js`). */
        Version: {
            /** Format: uuid */
            uuid: string;
            title: string | null;
            description: string | null;
            /**
             * @description Never `trashed` on the public surface — a trashed row is a plain 404.
             * @enum {string}
             */
            status: "draft" | "published";
            /** @enum {string|null} */
            versionType: "version" | "template" | null;
            /** Format: date-time */
            dateCreated: string;
            /** Format: date-time */
            dateModified: string;
            /** Format: date-time */
            datePublished: string | null;
            /** @description The content tree: an array of nodes keyed by atom/molecule slugs. `null` when the version has no content. */
            content: {
                [key: string]: unknown;
            }[] | null;
            rootAtoms: components["schemas"]["ProjectedRootAtom"][];
        };
        /** @description A root-atom VALUE projected against the container's current bindings (`projectVersionRootAtoms`, `queries/helpers/doctype-root-for-version.js`): atoms the type dropped are omitted, atoms it added surface with their default. Resolve `uuid` against `/atoms`. */
        ProjectedRootAtom: {
            /** Format: uuid */
            uuid: string;
            /** @description Any JSON value. An image field holds image uuid(s) — look them up in `referencedImages`. A file field holds media uuid(s) — look them up in `referencedFiles`; a non-uuid string there is an external URL written before file fields picked from the media library. A video field holds video uuid(s) — also in `referencedFiles` — and/or external video URLs (YouTube, Vimeo, …) as non-uuid strings. */
            value: unknown;
            /** @enum {integer} */
            locked: 0 | 1;
            /** @enum {integer} */
            required: 0 | 1;
            /** @description The binding's visibility condition, `null` when it has none. */
            condition: Record<string, never> | string | null;
        };
        /** @description The public image shape — `shapePublicImage` (`routes/media.js`). `cdnUrl` and the thumbnails are absolute CDN URLs. */
        Image: {
            /** Format: uuid */
            uuid: string;
            title: string | null;
            alt: string | null;
            mime: string;
            sizeBytes: number;
            width: number | null;
            height: number | null;
            /** Format: uri */
            cdnUrl: string;
            /**
             * Format: uri
             * @description `null` until the async thumbnail job has run.
             */
            thumb256Url: string | null;
            /** Format: uri */
            thumb1024Url: string | null;
            /** Format: date-time */
            dateCreated: string;
            /** @description `true` when an upload matched an existing image by content hash and the existing row was returned. */
            deduped: boolean;
        };
        /** @description An image referenced by a version's image fields (content or root atoms), — `shapeReferencedImage` (`queries/images/cast-image-row.js`). The `Image` fields except `deduped`, which only an upload answers. */
        ReferencedImage: {
            /** Format: uuid */
            uuid: string;
            title: string | null;
            alt: string | null;
            mime: string;
            sizeBytes: number;
            width: number | null;
            height: number | null;
            /** Format: uri */
            cdnUrl: string;
            /**
             * Format: uri
             * @description `null` until the async thumbnail job has run.
             */
            thumb256Url: string | null;
            /** Format: uri */
            thumb1024Url: string | null;
            /** Format: date-time */
            dateCreated: string;
        };
        /** @description A media-library file or video referenced by a version's file or video fields (content or root atoms) — `shapeReferencedFile` (`queries/images/cast-image-row.js`). `url` is the absolute CDN URL. */
        ReferencedFile: {
            /** Format: uuid */
            uuid: string;
            title: string | null;
            /** Format: uri */
            url: string;
            /** @description The name the file was uploaded with. */
            filename: string;
            /** @description The sniffed type, e.g. `application/pdf`. */
            mime: string;
            /** @description Bytes. */
            size: number;
        };
        /** @description The `document` half of a single document read — `shapePublicDocument` (`services/public-document-service.js`). */
        Document: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description: string | null;
            icon: string | null;
            /**
             * @description Never `trashed` on the public surface — a trashed row is a plain 404.
             * @enum {string}
             */
            status: "draft" | "published";
            /** Format: date-time */
            dateCreated: string;
            /** Format: date-time */
            dateModified: string;
            /** Format: date-time */
            datePublished: string | null;
            /** Format: uuid */
            parentUuid: string | null;
            documentType: components["schemas"]["DocumentTypeSummary"];
        };
        /** @description A term tagged on a document, with its active version's content inline (`groupTermsByTaxonomy`). */
        TaggedTerm: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description: string | null;
            icon: string | null;
            /** Format: uuid */
            parentUuid: string | null;
            /** @description The parent term's slug when the parent is published; `null` at the top level. */
            parentSlug: string | null;
            /** @description The term's manual position among its siblings (terms sharing its parent); terms are listed in this order, then by title. */
            sortOrder: number;
            /** Format: date-time */
            datePublished: string | null;
            content: {
                [key: string]: unknown;
            }[] | null;
            rootAtoms: components["schemas"]["ProjectedRootAtom"][];
        };
        /** @description A taxonomy the document is tagged in, with the tagged terms grouped under it. */
        DocumentTaxonomy: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            titlePlural: string | null;
            description: string | null;
            icon: string | null;
            terms: components["schemas"]["TaggedTerm"][];
        };
        /** @description One document with its version, tagged terms and referenced images. Every document write answers with this same shape (the working view), minus `poweredBy`. */
        DocumentRead: {
            document: components["schemas"]["Document"];
            version: components["schemas"]["Version"] | null;
            taxonomies: components["schemas"]["DocumentTaxonomy"][];
            referencedImages: components["schemas"]["ReferencedImage"][];
            referencedFiles: components["schemas"]["ReferencedFile"][];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description One entry of a document list — `shapePublicListedDocument`: the document fields plus the active version's `content` and projected `rootAtoms` inline. */
        ListedDocument: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description: string | null;
            icon: string | null;
            /**
             * @description Never `trashed` on the public surface — a trashed row is a plain 404.
             * @enum {string}
             */
            status: "draft" | "published";
            /** Format: uuid */
            parentUuid: string | null;
            /** Format: date-time */
            dateCreated: string;
            /** Format: date-time */
            dateModified: string;
            /** Format: date-time */
            datePublished: string | null;
            content: {
                [key: string]: unknown;
            }[] | null;
            rootAtoms: components["schemas"]["ProjectedRootAtom"][];
        };
        /** @description GET …/doctypes/{doctypeSlug}/documents — one page of the document type's documents; the page's referenced images ship once at the top level. */
        DocumentList: {
            documentType: components["schemas"]["DocumentTypeSummary"];
            documents: {
                results: components["schemas"]["ListedDocument"][];
                /** @description The TOTAL number of rows, not the page size. */
                count: number;
                /** @description The effective page size after clamping to the server maximum (50). */
                limit: number;
                offset: number;
                /** @description 1-based page number. */
                page: number;
            };
            referencedImages: components["schemas"]["ReferencedImage"][];
            referencedFiles: components["schemas"]["ReferencedFile"][];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        DocumentTrashed: {
            document: {
                /** Format: uuid */
                uuid: string;
                /** @description The rewritten slug `<slug>-trashed-<uuid>` — the original slug is free again. */
                slug: string;
                /** @enum {string} */
                status: "trashed";
            };
        };
        /** @description Body for creating or editing a document (`services/public-document-write-service.js`, validated by `validateContainerPayload`). `content` and `rootAtoms` may also be sent as JSON strings. */
        DocumentWrite: {
            /** @description Required on create; optional on edit. */
            title?: string;
            /** @description Omit on create to derive a unique slug from the title (`-2`, `-3`, … on collision). Supplied, it is used as-is — a collision is a 409 `SLUG_CONFLICT`. */
            slug?: string;
            description?: string;
            /** @description The content tree — an array of nodes shaped like the document type's preset template. On an edit it replaces the stored tree whole. */
            content?: {
                [key: string]: unknown;
            }[];
            /** @description Root-atom values keyed by ATOM UUID (the `uuid` of each entry in the document type's `atoms`). Unknown keys are refused with 422 naming the allowed list. Image fields take image uuid(s) from `POST …/media`. On an edit it replaces the stored set whole: an atom left out is cleared, so send every value to keep. */
            rootAtoms?: {
                [key: string]: unknown;
            };
            /** @description Uuids of the terms to tag. On an edit it replaces the tags whole. */
            taxonomyTerms?: string[];
        };
        /** @description `shapePublicTaxonomy` (`services/public-taxonomy-service.js`). The preset editor content tree is served in the working view only. */
        Taxonomy: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            titlePlural: string | null;
            description: string | null;
            icon: string | null;
            /**
             * @description `published`, or `draft` in the working view (`?status=draft`). The detail read resolves the taxonomy in any live status — it is the namespace for its terms.
             * @enum {string}
             */
            status: "draft" | "published";
            /** @enum {integer} */
            versioningEnabled: 0 | 1;
            /** Format: date-time */
            dateCreated: string;
            /** Format: date-time */
            dateModified: string;
            /** @description The preset tree every new term starts from — served in the working view only (`?status=draft`), for an author about to replace it. */
            content?: unknown[] | null;
            /** @description The root atoms a term of this taxonomy carries — what term writes validate `rootAtoms` against. */
            atoms: components["schemas"]["RootAtomBinding"][];
            /** @description Uuids of the molecules a term's content tree may hold at the top level — resolve against `/molecules`. */
            supports: string[];
            /** @description Published terms — on the detail read in the working view (`?status=draft`), every non-trashed term (the term page's total). */
            termCount: number;
            /** @description The document types that offer this taxonomy. */
            documentTypes: components["schemas"]["DocumentTypeSummary"][];
        };
        /** @description GET …/taxonomies — every published taxonomy in the project (drafts too with `?status=draft`). */
        TaxonomyList: {
            results: components["schemas"]["Taxonomy"][];
            /** @description Equal to `results.length` — the list is never paginated. */
            count: number;
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description Body for creating or editing a taxonomy (`services/public-structure-write-service.js`) — `DocumentTypeWrite` without `taxonomies` (document types list the taxonomies they offer). */
        TaxonomyWrite: {
            title: string;
            titlePlural?: string;
            /** @description Omit to derive a unique slug from the title. */
            slug?: string;
            description?: string;
            icon?: string;
            /**
             * @description Only a published taxonomy can be offered by a document type.
             * @default draft
             * @enum {string}
             */
            status?: "draft" | "published";
            /**
             * @description Keep a version history of every term (fork on publish). Studio's create form defaults this off; the API takes the column default.
             * @default true
             * @enum {boolean|integer}
             */
            versioningEnabled?: true | false | 0 | 1;
            /** @description The root atoms (top-level fields) of a term of this taxonomy. */
            atoms?: components["schemas"]["AtomBindingWrite"][];
            /** @description Published molecules a term's content tree may hold at the top level. */
            supports?: string[];
            /** @description The preset tree every new term starts from — top-level nodes must be molecules in `supports`. */
            content?: components["schemas"]["PresetNode"][];
        };
        /** @description The taxonomy as the working-view read (`GET …/taxonomies/{slug}?status=draft`) serves it, without the page of terms. */
        TaxonomyCreated: {
            taxonomy: components["schemas"]["Taxonomy"];
        };
        /** @description `shapePublicTerm` (`services/public-taxonomy-service.js`). */
        Term: {
            /** Format: uuid */
            uuid: string;
            slug: string;
            title: string;
            description: string | null;
            icon: string | null;
            /**
             * @description Never `trashed` on the public surface — a trashed row is a plain 404.
             * @enum {string}
             */
            status: "draft" | "published";
            /**
             * Format: uuid
             * @description The parent term (`null` = top level) — terms are hierarchical within a taxonomy.
             */
            parentUuid: string | null;
            /** @description The parent term's slug when the parent is readable in the same view (published, or any live status in the `status=draft` view); `null` at the top level. */
            parentSlug: string | null;
            /** @description The term's manual position among its siblings (terms sharing its parent), as arranged in Studio. Term lists are ordered by it, then by title. */
            sortOrder: number;
            /** Format: date-time */
            dateCreated: string;
            /** Format: date-time */
            dateModified: string;
            /** Format: date-time */
            datePublished: string | null;
        };
        /** @description One entry of a taxonomy's term page — the term fields plus its active version's content inline. */
        ListedTerm: components["schemas"]["Term"] & {
            /** @description `null` for a term that never had a published version. */
            content: {
                [key: string]: unknown;
            }[] | null;
            rootAtoms: components["schemas"]["ProjectedRootAtom"][];
        };
        /** @description GET …/taxonomies/{slug} — the taxonomy plus one page of its published terms. */
        TaxonomyRead: {
            taxonomy: components["schemas"]["Taxonomy"];
            terms: {
                results: components["schemas"]["ListedTerm"][];
                /** @description The TOTAL number of rows, not the page size. */
                count: number;
                /** @description The effective page size after clamping to the server maximum (50). */
                limit: number;
                offset: number;
                /** @description 1-based page number. */
                page: number;
            };
            referencedImages: components["schemas"]["ReferencedImage"][];
            referencedFiles: components["schemas"]["ReferencedFile"][];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description One term with its active version, hydrated like a document. `version` is `null` for a published term that never had a published version — a legitimate state for terms, unlike documents. Every term write answers with this same shape (the working view), minus `poweredBy`. */
        TermRead: {
            term: components["schemas"]["Term"] & {
                taxonomy: components["schemas"]["TaxonomySummary"];
            };
            version: components["schemas"]["Version"] | null;
            referencedImages: components["schemas"]["ReferencedImage"][];
            referencedFiles: components["schemas"]["ReferencedFile"][];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        TermTrashed: {
            term: {
                /** Format: uuid */
                uuid: string;
                /** @description The rewritten slug `<slug>-trashed-<uuid>` — the original slug is free again. */
                slug: string;
                /** @enum {string} */
                status: "trashed";
            };
        };
        /** @description Body for creating or editing a term (`services/public-term-write-service.js`). Same rules as `DocumentWrite`, plus hierarchy. */
        TermWrite: {
            /** @description Required on create; optional on edit. */
            title?: string;
            /** @description Omit on create to derive a unique slug from the title. */
            slug?: string;
            description?: string;
            /** @description The slug of a live term in the SAME taxonomy to nest under; `null` makes the term top-level; absent leaves the parent alone. Never the term itself. */
            parentSlug?: string | null;
            /** @description The content tree. On an edit it replaces the stored tree whole. */
            content?: {
                [key: string]: unknown;
            }[];
            /** @description Root-atom values keyed by atom uuid — must be atoms the taxonomy binds (`atoms` on the taxonomy read). On an edit it replaces the stored set whole: an atom left out is cleared, so send every value to keep. */
            rootAtoms?: {
                [key: string]: unknown;
            };
        };
        MediaUploadByUrl: {
            /**
             * Format: uri
             * @description A public `http(s)` URL of an image, file or video, fetched server-side (max 3 redirects, 10 s). Private/loopback addresses, a served content type the library does not take and a body past the larger upload cap are refused with 422 — `fields.url` names the reason class (`URL_PRIVATE_ADDRESS`, `URL_TOO_LARGE`, `URL_NOT_ACCEPTED`, …). A fetched file over its own type's cap (20 MiB for images and files, 30 MiB for videos by default) is 413 `FILE_TOO_LARGE`, and a sniffed type the library does not take is 415 `UNSUPPORTED_MEDIA_TYPE`.
             */
            url: string;
            title?: string;
            alt?: string;
        };
        MediaUploadMultipart: {
            /**
             * Format: binary
             * @description One image, file or video.
             */
            file?: string;
            /** @description Several images, files or videos (up to 25 parts per field). */
            files?: string[];
            title?: string;
            alt?: string;
        };
        /** @description One media-library row — `shapePublicMedia` (`services/public-media-service.js`): the `Image` fields except `deduped`, plus `filename`, `description` and `dateModified`. Files and videos have no `width` / `height` and no thumbnails. */
        MediaItem: {
            /** Format: uuid */
            uuid: string;
            title: string | null;
            alt: string | null;
            mime: string;
            sizeBytes: number;
            width: number | null;
            height: number | null;
            /** Format: uri */
            cdnUrl: string;
            /**
             * Format: uri
             * @description `null` until the async thumbnail job has run.
             */
            thumb256Url: string | null;
            /** Format: uri */
            thumb1024Url: string | null;
            /** Format: date-time */
            dateCreated: string;
            /** @description The name the file was uploaded with. */
            filename: string | null;
            description: string | null;
            /** Format: date-time */
            dateModified: string;
        };
        /** @description GET …/media — one page of the project's media library, newest first. */
        MediaList: {
            images: {
                results: components["schemas"]["MediaItem"][];
                /** @description The TOTAL number of rows, not the page size. */
                count: number;
                /** @description The effective page size after clamping to the server maximum (50). */
                limit: number;
                offset: number;
                /** @description 1-based page number. */
                page: number;
            };
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description GET …/media/{uuid} — one media-library row. */
        MediaRead: {
            image: components["schemas"]["MediaItem"];
            /** @description Present on every read for organizations without the `removeBranding` entitlement (the value is `Powered by Hypervalent`). Never present on write responses. */
            poweredBy?: string;
        };
        /** @description A multipart upload answers `{ images, errors }`; a JSON `{ url }` upload answers `{ image }`. */
        MediaUploadResult: {
            image?: components["schemas"]["Image"];
            images?: components["schemas"]["Image"][];
            /** @description Per-file failures of a multipart upload (the request still answers 200 when at least one file was stored). */
            errors?: {
                filename: string;
                error: components["schemas"]["Error"];
            }[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listProjects: {
        parameters: {
            query?: {
                /** @description Page size, clamped to the server maximum (50). */
                limit?: number;
                /** @description 1-based page number. Wins over `offset` when both are given. */
                page?: number;
                /** @description Row offset — an alternative to `page`, ignored when a valid `page` is given. */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listAtoms: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AtomList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createAtom: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtomWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AtomCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAtom: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AtomRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateAtom: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AtomWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AtomCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. Also: CANNOT_DRAFT_IN_USE. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listDesignTokenSchemes: {
        parameters: {
            query?: {
                /** @description Filter by token type (e.g. `color`). */
                token_type?: string;
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DesignTokenSchemeList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDesignTheme: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DesignThemeRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateDesignTheme: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DesignThemeWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DesignThemeResult"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listDesignTokens: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
                /** @description Filter by token type (e.g. `color`). */
                token_type?: string;
                /** @description Filter component tokens by their M3 component (e.g. `switch`); comma-separate several. */
                component?: string;
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DesignTokenList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateDesignTokens: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DesignTokenEdits"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DesignTokenEditResult"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDesignTokensCss: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/css": string;
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDesignTokensW3C: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["W3CDesignTokens"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listDocumentTypes: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTypeList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createDocumentType: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentTypeWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTypeCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) Also: LIMIT_EXCEEDED. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listDocuments: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
                /** @description The order of the list; a leading `-` reverses it. Every order breaks ties the same way, so offset paging stays deterministic. A document with no `datePublished` (a never-published draft in the `status=draft` view) sorts as the oldest: first ascending, last descending. */
                sort?: "title" | "-title" | "datePublished" | "-datePublished" | "dateModified" | "-dateModified";
                /** @description The slug of the taxonomy that owns `term`. Send both or neither. */
                taxonomy?: string;
                /** @description Lists only the documents tagged with this term, and `count` counts only those. Tags belong to a version, so a published read matches the active version's tags and `status=draft` the working version's. A term this read cannot see answers 404, the same as an unknown slug. */
                term?: string;
                /** @description Lists only the rows with a `dateModified` at or after this instant, and `count` counts only those. An ISO 8601 date-time with a zone, like `2026-01-31T09:30:00Z`; anything else is a 422, and a `+` offset must be percent-encoded. Inclusive to the second, so a row can come back twice across builds but is not missed. It **cannot report removals**: a row that leaves the view, trashed or (in the published view) unpublished, just stops appearing, so pair it with a periodic full walk or with webhooks. An edit to a term or image a row references does not move the row's `dateModified`. Saving a draft of a published row moves it too, so a published read can return it with its content unchanged. */
                modifiedSince?: string;
                /** @description Page size, clamped to the server maximum (50). */
                limit?: number;
                /** @description 1-based page number. Wins over `offset` when both are given. */
                page?: number;
                /** @description Row offset — an alternative to `page`, ignored when a valid `page` is given. */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The document type slug — a path namespace, so a draft document type can still own published documents. */
                doctypeSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — `sort` is not one of the listed orders, `taxonomy` and `term` are not one non-blank value each, or `modifiedSince` is not a date-time with a zone; `fields` names the problem */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The document type slug — a path namespace, so a draft document type can still own published documents. */
                doctypeSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDocument: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The document type slug — a path namespace, so a draft document type can still own published documents. */
                doctypeSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The document type slug — a path namespace, so a draft document type can still own published documents. */
                doctypeSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    publishDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The document type slug — a path namespace, so a draft document type can still own published documents. */
                doctypeSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    trashDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The document type slug — a path namespace, so a draft document type can still own published documents. */
                doctypeSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTrashed"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    unpublishDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The document type slug — a path namespace, so a draft document type can still own published documents. */
                doctypeSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getDocumentType: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTypeRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateDocumentType: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentTypeWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTypeCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. Also: CANNOT_DRAFT_IN_USE. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listLibrary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LibraryCatalogue"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    insertLibraryItems: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LibraryInsert"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LibraryPlan"];
                };
            };
            /** @description LIBRARY_ITEMS_INVALID */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    planLibraryInsert: {
        parameters: {
            query: {
                /** @description Comma-separated `kind:slug` pairs, e.g. `molecule:hero,atom:headline`. */
                items: string;
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LibraryPlan"];
                };
            };
            /** @description LIBRARY_ITEMS_INVALID */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listMedia: {
        parameters: {
            query?: {
                /** @description Page size, clamped to the server maximum (50). */
                limit?: number;
                /** @description 1-based page number. Wins over `offset` when both are given. */
                page?: number;
                /** @description Row offset — an alternative to `page`, ignored when a valid `page` is given. */
                offset?: number;
                /** @description `image`, `video` or `audio` by type; `document` is PDFs, office documents, zip, CSV and text; `file` is everything that is not an image. Anything else is a 422. */
                mediaType?: "image" | "video" | "audio" | "document" | "file";
                /** @description Matches the title or the uploaded filename. */
                search?: string;
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MediaList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform Also: `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — an unknown `mediaType`, or a repeated `search`; `fields` names it */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uploadMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["MediaUploadMultipart"];
                "application/json": components["schemas"]["MediaUploadByUrl"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MediaUploadResult"];
                };
            };
            /** @description EMPTY_FILE / UPLOAD_FAILED */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) Also: LIMIT_EXCEEDED. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description UNSUPPORTED_MEDIA_TYPE */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The media item's `uuid`, as an upload, a list page or a content read's `referencedImages` / `referencedFiles` returns it. */
                uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MediaRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform Also: `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listMolecules: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoleculeList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createMolecule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MoleculeWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoleculeCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getMolecule: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoleculeRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateMolecule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MoleculeWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MoleculeCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. Also: CANNOT_DRAFT_IN_USE. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listSettings: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SettingList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSetting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SettingRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listTaxonomies: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaxonomyList"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createTaxonomy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaxonomyWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaxonomyCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) Also: LIMIT_EXCEEDED. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getTaxonomy: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
                /** @description Lists only the rows with a `dateModified` at or after this instant, and `count` counts only those. An ISO 8601 date-time with a zone, like `2026-01-31T09:30:00Z`; anything else is a 422, and a `+` offset must be percent-encoded. Inclusive to the second, so a row can come back twice across builds but is not missed. It **cannot report removals**: a row that leaves the view, trashed or (in the published view) unpublished, just stops appearing, so pair it with a periodic full walk or with webhooks. An edit to a term or image a row references does not move the row's `dateModified`. Saving a draft of a published row moves it too, so a published read can return it with its content unchanged. */
                modifiedSince?: string;
                /** @description Page size, clamped to the server maximum (50). */
                limit?: number;
                /** @description 1-based page number. Wins over `offset` when both are given. */
                page?: number;
                /** @description Row offset — an alternative to `page`, ignored when a valid `page` is given. */
                offset?: number;
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaxonomyRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — `modifiedSince` is not a date-time with a zone; `fields` names the problem */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateTaxonomy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaxonomyWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaxonomyCreated"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. Also: CANNOT_DRAFT_IN_USE. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createTerm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The taxonomy slug — a path namespace, like `doctypeSlug`. */
                taxonomySlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TermWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TermRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getTerm: {
        parameters: {
            query?: {
                /** @description `published` (default) reads live content. `draft` reads the **working view** — every non-trashed row, draft or published, with its latest working version — and needs a `read_write` token on a plan with API writes. Any other caller asking for `draft` is refused with 403 (`TOKEN_SCOPE_READ_ONLY` for a `read` token, `FEATURE_DISABLED` when the plan has no API writes) before the resource is looked up, so the answer is the same for every slug and a read token never learns what draft work exists. Any other value reads published. */
                status?: "published" | "draft";
            };
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The taxonomy slug — a path namespace, like `doctypeSlug`. */
                taxonomySlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TermRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform; `TOKEN_SCOPE_READ_ONLY` — `status=draft` from a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — `status=draft` on a plan with no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    updateTerm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The taxonomy slug — a path namespace, like `doctypeSlug`. */
                taxonomySlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TermWrite"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TermRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    publishTerm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The taxonomy slug — a path namespace, like `doctypeSlug`. */
                taxonomySlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TermRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    trashTerm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The taxonomy slug — a path namespace, like `doctypeSlug`. */
                taxonomySlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TermTrashed"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. Also: CANNOT_TRASH_IN_USE. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    unpublishTerm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
                /** @description The project slug. Discover it with `GET /orgs/{org_id}/projects`. A project-narrowed token may only name its own project (403 `TOKEN_PROJECT_MISMATCH` otherwise). */
                projectSlug: string;
                /** @description The taxonomy slug — a path namespace, like `doctypeSlug`. */
                taxonomySlug: string;
                /** @description The resource slug. */
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TermRead"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform ; `TOKEN_SCOPE_READ_ONLY` — a `read` token (carries `requiredPlan`); `FEATURE_DISABLED` — the plan has no API writes (carries `requiredPlan`) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VERSION_LOCKED` — an editor holds the checkout (`holder.name`, `expiresAt`; nothing was written); `SLUG_CONFLICT` — the slug is taken. Also: CANNOT_DRAFT_IN_USE. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `VALIDATION_ERROR` — the payload was refused; `fields` names each problem. Nothing was written. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `PLATFORM_READ_ONLY` / `PLATFORM_MAINTENANCE` — writes are paused platform-wide; `Retry-After` says how long. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getToken: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The organization's public id — shown in Studio → Settings → API tokens and in the MCP server URL. Never the organization's uuid. */
                org_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenWhoami"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getTokenOrgless: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenWhoamiOrgless"];
                };
            };
            /** @description `API_TOKEN_REQUIRED` — no credential; `INVALID_API_TOKEN` — revoked, expired, unknown, or another organization's token (nested `{ error }` envelope from the authenticator). */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `BILLING_TERMINATED` — the organization's subscription was terminated for non-payment. */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `TOKEN_ORG_MISMATCH` / `TOKEN_PROJECT_MISMATCH` — the credential does not cover the URL's org or project; `ACCOUNT_CLOSED`; `DELIVERY_BLOCKED` — content delivery for the organization is blocked by the platform */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"] | components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description `NOT_FOUND` — unknown org id, project slug, or resource. Never distinguishes "does not exist" from "not published". */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `RATE_LIMITED` — the per-credential limit was hit. `Retry-After` says how long to wait; draft-8 `RateLimit` headers name the policy. */
            429: {
                headers: {
                    /** @description Seconds to wait. */
                    "Retry-After"?: number;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description `QUERY_FAILED` — the read or write could not complete. Never an empty 200. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
