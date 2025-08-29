module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', 'packages/*/dist/', 'apps/*/dist/'],
  overrides: [
    {
      files: ['packages/*/src/**/*.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      files: ['apps/*/src/**/*.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};
