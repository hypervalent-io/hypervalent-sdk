// Compile-time test, checked by `npm run typecheck`: a write body may omit every field the API
// defaults (CMS-772). The spec declares `default` on these fields without listing them in
// `required`, and the generator must keep them optional.
import type { components } from '../src/generated/openapi'
import type { ProjectResources } from '../src/resources'

type Schemas = components['schemas']
type CreateBody<R extends keyof ProjectResources> = ProjectResources[R] extends { create: (body: infer B, ...rest: never[]) => unknown } ? B : never

// The smallest bodies the API accepts: `status`, `category`, `multiple` and `versioningEnabled` left out.
export const minimalAtom: CreateBody<'atoms'> = { title: 'Headline', fieldType: 'text' }
export const minimalMolecule: CreateBody<'molecules'> = { title: 'Hero' }
export const minimalDoctype: CreateBody<'doctypes'> = { title: 'Page' }
export const minimalTaxonomy: CreateBody<'taxonomies'> = { title: 'Category' }

// The defaulted fields are still typed when they are sent.
export const fullAtom: Schemas['AtomWrite'] = { title: 'Tags', fieldType: 'text', status: 'published', category: 'content', multiple: true }
export const fullDoctype: Schemas['DocumentTypeWrite'] = { title: 'Post', status: 'draft', versioningEnabled: 0 }

// A field the spec does require stays required.
// @ts-expect-error `fieldType` has no default
export const atomWithoutFieldType: Schemas['AtomWrite'] = { title: 'Headline' }
// @ts-expect-error `title` has no default
export const doctypeWithoutTitle: Schemas['DocumentTypeWrite'] = {}
