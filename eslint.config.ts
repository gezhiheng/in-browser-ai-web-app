import antfu from '@antfu/eslint-config'

export default antfu({
  vue: {
    overrides: {
      'vue/multi-word-component-names': 'off',
    },
  },
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/*.md',
    'tsconfig.json',
  ],
})
