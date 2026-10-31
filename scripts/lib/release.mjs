// What must be true of package.json and the changelog before a release.
const PACKAGE_NAME = '@hypervalent-io/sdk'
// npm's trusted publishing compares this with the workflow's repository.
const REPOSITORY_URL = 'git+https://github.com/hypervalent-io/hypervalent-sdk.git'

/** @param {{ pkg: Record<string, any>, changelog: string, tag?: string }} input */
export function releaseProblems({ pkg, changelog, tag }) {
  const problems = []
  if (pkg.name !== PACKAGE_NAME) problems.push(`package name is ${pkg.name}, expected ${PACKAGE_NAME}`)
  if (pkg.private) problems.push('package.json is private')
  if (pkg.repository?.url !== REPOSITORY_URL) problems.push(`repository.url must be ${REPOSITORY_URL}`)
  if (pkg.publishConfig?.access !== 'public') problems.push('publishConfig.access must be public, because the package is scoped')
  if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) problems.push(`version ${pkg.version} is not MAJOR.MINOR.PATCH`)
  if (!changelog.split('\n').some(line => line === `## ${pkg.version}` || line.startsWith(`## ${pkg.version} `))) {
    problems.push(`CHANGELOG.md has no "## ${pkg.version}" section`)
  }
  if (tag !== undefined && tag !== `v${pkg.version}`) problems.push(`tag ${tag} does not match package.json version ${pkg.version}`)
  return problems
}
