import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/webhooks.ts'],
  format: ['esm', 'cjs'],
  target: 'es2022',
  platform: 'neutral',
  dts: true,
  clean: true,
  sourcemap: true
})
