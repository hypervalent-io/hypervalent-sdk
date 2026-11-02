import { defineConfig } from 'tsup'

// Its own step, after the client's clean build, so the client's platform stays
// neutral and only this bundle may touch Node.
export default defineConfig({
  entry: { cli: 'src/cli/index.ts' },
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  dts: false,
  clean: false,
  sourcemap: false
})
