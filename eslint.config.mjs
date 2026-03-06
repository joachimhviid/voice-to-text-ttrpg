// // @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import pluginPerfectionist from 'eslint-plugin-perfectionist'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import vueParser from 'vue-eslint-parser'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default withNuxt(
  {
    name: 'prettier',
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': [
        'error',
        {
          bracketSpacing: true,
          endOfLine: 'auto',
          plugins: ['prettier-plugin-tailwindcss'],
          printWidth: 120,
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
        },
      ],
    },
  },
  {
    name: 'perfectionist',
    plugins: { perfectionist: pluginPerfectionist },
    rules: {
      'perfectionist/sort-enums': ['error', { order: 'asc', sortByValue: 'never', type: 'natural' }],
      'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-object-types': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-union-types': ['error', { order: 'asc', type: 'natural' }],
    },
  },
  {
    languageOptions: {
      parser: vueParser,
    },
    name: 'tailwindcss/vue',
  },
  {
    name: 'tailwindcss',
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
  },
)
