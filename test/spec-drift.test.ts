import { canonicalJson, describeDrift, operationIds } from '../scripts/lib/spec.mjs'

import { describe, expect, it } from 'vitest'

const spec = (version: string, ...ids: string[]) => ({
  info: { version },
  paths: Object.fromEntries(ids.map(id => [`/${id}`, {
    parameters: [],
    get: { operationId: id }
  }]))
})

describe('describeDrift', () => {
  it('ignores key order and formatting', () => {
    const reordered = { paths: { '/a': { get: { operationId: 'a' }, parameters: [] } }, info: { version: '1.0.0' } }
    expect(describeDrift(spec('1.0.0', 'a'), reordered)).toBeNull()
    expect(canonicalJson({ b: 1, a: [{ d: 1, c: 2 }] })).toBe('{"a":[{"c":2,"d":1}],"b":1}')
  })

  it('reports version and operation changes', () => {
    expect(describeDrift(spec('1.0.0', 'a', 'b'), spec('1.1.0', 'b', 'c'))).toEqual({
      vendoredVersion: '1.0.0',
      liveVersion: '1.1.0',
      addedOperations: ['c'],
      removedOperations: ['a']
    })
  })

  it('reports a change that touches no operation id', () => {
    const live = spec('1.0.0', 'a')
    live.paths['/a']!.parameters = [{ name: 'x' }] as never[]
    expect(describeDrift(spec('1.0.0', 'a'), live)).toMatchObject({ addedOperations: [], removedOperations: [] })
  })
})

describe('operationIds', () => {
  it('reads operations only, not path-level keys', () => {
    expect(operationIds(spec('1.0.0', 'a', 'b'))).toEqual(['a', 'b'])
  })
})
