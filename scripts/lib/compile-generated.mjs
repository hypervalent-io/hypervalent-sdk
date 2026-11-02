import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * Type-checks in-memory TypeScript files against the SDK's source under `strict`,
 * as a customer's project would see the package. `ts` is the caller's `typescript`
 * module, because the root repo's e2e runs without this repo's node_modules.
 * `files` maps a name to its text. Answers the diagnostics as strings.
 */
export function compileGenerated(ts, files) {
  const virtual = new Map(Object.entries(files).map(([name, text]) => [join(ROOT, '__generated__', name), text]))
  const options = {
    strict: true,
    noUnusedLocals: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    types: [],
    paths: { '@hypervalent-io/sdk': [join(ROOT, 'src', 'index.ts')] }
  }
  const host = ts.createCompilerHost(options)
  const { fileExists, readFile, getSourceFile, directoryExists } = host
  const virtualDir = join(ROOT, '__generated__')
  host.directoryExists = name => name === virtualDir || (directoryExists ? directoryExists(name) : true)
  host.fileExists = name => virtual.has(name) || fileExists(name)
  host.readFile = name => virtual.get(name) ?? readFile(name)
  host.getSourceFile = (name, version, ...rest) => (virtual.has(name)
    ? ts.createSourceFile(name, virtual.get(name), version)
    : getSourceFile(name, version, ...rest))
  const program = ts.createProgram([...virtual.keys()], options, host)
  return ts.getPreEmitDiagnostics(program).map((diagnostic) => {
    const where = diagnostic.file ? `${diagnostic.file.fileName.replace(`${ROOT}/`, '')}:${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1} ` : ''
    return `${where}${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
  })
}
