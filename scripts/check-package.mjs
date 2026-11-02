// Installs the packed tarball into a new project, the way a customer would, and
// runs a read from it as ESM and CJS against a local stand-in for the API.
// Nothing goes to the registry: the package has no runtime dependencies to fetch.
import { execFile as execFileCallback } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFile = promisify(execFileCallback)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const REQUIRED = ['package.json', 'README.md', 'LICENSE', 'CHANGELOG.md', 'dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/index.d.cts', 'dist/webhooks.js', 'dist/webhooks.cjs', 'dist/webhooks.d.ts', 'dist/webhooks.d.cts', 'dist/cli.js']
const TOKEN = 'atk_package_check'

const READ = `
const hv = createClient({ token: process.env.CHECK_TOKEN, baseUrl: process.env.CHECK_BASE_URL, org: 'acme', maxRetries: 0 })
hv.project('site').documents('post').list().then((answer) => {
  if (answer.documents?.results?.[0]?.slug !== 'hello') throw new Error('unexpected answer: ' + JSON.stringify(answer))
  console.log(process.argv[1].split('/').pop() + ' read OK')
})
`

const PROJECT = { uuid: '00000000-0000-4000-8000-000000000001', slug: 'site', title: 'Site' }
const list = results => ({ results, count: results.length })
const ROUTES = {
  '/v1/token': { token: { projectSlug: null }, org: { slug: 'acme' } },
  '/v1/orgs/acme/projects': { ...list([PROJECT]), limit: 50, offset: 0, page: 1 },
  '/v1/orgs/acme/projects/site/atoms': list([{ uuid: '00000000-0000-4000-8000-000000000002', slug: 'headline', fieldType: 'text', multiple: 0 }]),
  '/v1/orgs/acme/projects/site/molecules': list([]),
  '/v1/orgs/acme/projects/site/taxonomies': list([]),
  '/v1/orgs/acme/projects/site/doctypes': list([{ uuid: '00000000-0000-4000-8000-000000000003', slug: 'post', atoms: [{ uuid: '00000000-0000-4000-8000-000000000002' }], supports: [] }]),
  '/v1/orgs/acme/projects/site/doctypes/post/documents': { documents: { results: [{ slug: 'hello' }], count: 1, limit: 25, offset: 0, page: 1 } }
}

const server = createServer((req, res) => {
  const authorized = req.headers.authorization === `Bearer ${TOKEN}`
  const answer = ROUTES[new URL(req.url, 'http://x').pathname]
  res.writeHead(!authorized ? 401 : answer ? 200 : 404, { 'content-type': 'application/json' })
  res.end(JSON.stringify(authorized
    ? answer ?? { status: 404, code: 'NOT_FOUND', message: 'no route' }
    : { status: 401, code: 'UNAUTHORIZED', message: 'bad token' }))
})

const dir = await mkdtemp(join(tmpdir(), 'hypervalent-sdk-package-'))
try {
  const { stdout } = await execFile('npm', ['pack', '--json', '--pack-destination', dir], { cwd: root, maxBuffer: 1 << 26 })
  // prepack's build output can precede the JSON.
  const [packed] = JSON.parse(stdout.slice(stdout.indexOf('[\n')))
  const files = packed.files.map(file => file.path)
  const missing = REQUIRED.filter(path => !files.includes(path))
  if (missing.length > 0) throw new Error(`the tarball is missing: ${missing.join(', ')}`)
  const stray = files.filter(path => !REQUIRED.includes(path) && !path.startsWith('dist/'))
  if (stray.length > 0) throw new Error(`the tarball has unexpected files: ${stray.join(', ')}`)

  const project = join(dir, 'project')
  await mkdir(project)
  await writeFile(join(project, 'package.json'), '{ "name": "fresh-project", "private": true }\n')
  await execFile('npm', ['install', join(dir, packed.filename), '--no-audit', '--no-fund'], { cwd: project })
  await writeFile(join(project, 'read.mjs'), `import { createClient } from '@hypervalent-io/sdk'\n${READ}`)
  await writeFile(join(project, 'read.cjs'), `const { createClient } = require('@hypervalent-io/sdk')\n${READ}`)

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const env = { ...process.env, CHECK_TOKEN: TOKEN, CHECK_BASE_URL: `http://127.0.0.1:${server.address().port}` }
  for (const script of ['read.mjs', 'read.cjs']) {
    const result = await execFile(process.execPath, [script], { cwd: project, env })
    process.stdout.write(result.stdout)
  }

  // The way a customer runs it: through npm's bin link, with the published package name.
  const generated = join(project, 'src', 'schema.ts')
  const cli = await execFile('npx', ['--no-install', 'hypervalent-sdk', 'typegen', '--project', 'site', '--out', generated, '--base-url', env.CHECK_BASE_URL], { cwd: project, env: { ...env, HYPERVALENT_TOKEN: TOKEN } })
  process.stdout.write(cli.stdout)
  const source = await readFile(generated, 'utf8')
  if (!source.includes('"headline": string') || !source.includes(`from '@hypervalent-io/sdk'`)) throw new Error(`unexpected typegen output:\n${source}`)

  console.log(`${packed.filename}: ${files.length} files, ${packed.size} bytes`)
}
finally {
  server.close()
  await rm(dir, { recursive: true, force: true })
}
