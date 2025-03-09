// eslint.config.js
import typescriptEslint from '@typescript-eslint/eslint-plugin';

export default [
  // Global ignore patterns
  {
    ignores: [
      'app/(pages)/setting/users/_components/_add-user-dialog/*.tsx',
      'another/path/**/*.ts',
    ],
  },
  // ESLint configuration
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Your ESLint rules here
    },
  },
];
