// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Every viewmodel in this app deliberately loads its data on mount via
      // `useEffect(() => { loadPage(...) }, [loadPage])` — the standard
      // fetch-on-mount shape used consistently across the codebase. This rule
      // flags that pattern everywhere; revisit case by case instead of a
      // blanket refactor.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/__tests__/**', 'src/test-utils/**'],
    rules: {
      // jest.mock factories are hoisted above imports, so shared mocks can
      // only be pulled in with require().
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
