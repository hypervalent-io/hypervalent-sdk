const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])

/** Every operationId in an OpenAPI document, in document order. */
export function operationIds(spec) {
  return Object.values(spec.paths ?? {}).flatMap(pathItem =>
    Object.entries(pathItem)
      .filter(([method]) => HTTP_METHODS.has(method))
      .map(([, operation]) => operation.operationId)
  )
}

/** Stable JSON with sorted keys, so formatting and key order are not differences. */
export function canonicalJson(value) {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value === null || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, sortKeys(value[key])])
  )
}

/**
 * Compares the vendored spec with a published one.
 * Answers null when they match, otherwise what a person needs to see first.
 */
export function describeDrift(vendored, live) {
  if (canonicalJson(vendored) === canonicalJson(live)) return null
  const vendoredIds = new Set(operationIds(vendored))
  const liveIds = new Set(operationIds(live))
  return {
    vendoredVersion: vendored.info?.version,
    liveVersion: live.info?.version,
    addedOperations: [...liveIds].filter(id => !vendoredIds.has(id)),
    removedOperations: [...vendoredIds].filter(id => !liveIds.has(id))
  }
}
