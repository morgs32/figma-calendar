import { baseConfig, defineConfig } from '@morgs32/eslint-config'

const eslintConfig = defineConfig(
  {
    ignores: ['dist', 'node_modules', '.turbo', '.next', 'next-env.d.ts'],
  },
  baseConfig
)

export default eslintConfig
