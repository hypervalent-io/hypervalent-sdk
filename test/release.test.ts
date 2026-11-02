import { releaseProblems } from '../scripts/lib/release.mjs'

import { describe, expect, it } from 'vitest'

const pkg = {
  name: '@hypervalent-io/sdk',
  version: '1.2.3',
  repository: { url: 'git+https://github.com/hypervalent-io/hypervalent-sdk.git' },
  publishConfig: { access: 'public' }
}
const changelog = '# Changelog\n\n## 1.2.3\n\nThings.\n'

describe('releaseProblems', () => {
  it('passes a releasable package, with and without a tag', () => {
    expect(releaseProblems({ pkg, changelog })).toEqual([])
    expect(releaseProblems({ pkg, changelog, tag: 'v1.2.3' })).toEqual([])
  })

  it('refuses a tag that is not the package version', () => {
    expect(releaseProblems({ pkg, changelog, tag: 'v1.2.4' })).toHaveLength(1)
  })

  it('refuses a version with no changelog section', () => {
    expect(releaseProblems({ pkg, changelog: '## 1.2.30\n' })).toHaveLength(1)
  })

  it('refuses a version npm would treat as a prerelease', () => {
    expect(releaseProblems({ pkg: { ...pkg, version: '1.2.3-rc.1' }, changelog: '## 1.2.3-rc.1\n' })).toHaveLength(1)
  })

  it('refuses metadata that would break publishing', () => {
    expect(releaseProblems({ pkg: { ...pkg, repository: { url: 'https://github.com/x/y' } }, changelog })).toHaveLength(1)
    expect(releaseProblems({ pkg: { ...pkg, publishConfig: {} }, changelog })).toHaveLength(1)
    expect(releaseProblems({ pkg: { ...pkg, private: true }, changelog })).toHaveLength(1)
  })
})
