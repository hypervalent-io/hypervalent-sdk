import { builtinModules } from 'node:module'

import jsLint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['node_modules', 'dist', 'coverage', 'src/generated'] },
  jsLint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'simple-import-sort': pluginSimpleImportSort },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            [`node:`, `^(${builtinModules.join('|')})(/|$)`],
            ['^\\u0000'],
            ['^@?\\w.*\\u0000$', '^[^.].*\\u0000$', '^\\..*\\u0000$'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$']
          ]
        }
      ]
    }
  },
  stylistic.configs['disable-legacy'],
  stylistic.configs.customize({ indent: 2, semi: false, commaDangle: 'never' }),
  {
    files: ['scripts/**', 'test/**', '*.config.*'],
    languageOptions: { globals: { ...globals.node } }
  }
]
