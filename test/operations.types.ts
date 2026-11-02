// Compile-time half of the coverage test, checked by `npm run typecheck`:
// the generated id list and the generated `operations` type must name the same set.
import type { operations } from '../src/generated/openapi'
import type { OPERATION_IDS } from '../src/generated/spec'

type Listed = (typeof OPERATION_IDS)[number]
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

export const listedAndTypedMatch: Equal<Listed, keyof operations> = true
