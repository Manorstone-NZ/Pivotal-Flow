module.exports = {
  root: true,
  env: { es2023: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { 
    project: ["./tsconfig.base.json"],
    ecmaVersion: 2023,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "unused-imports", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  rules: {
    // safety
    "no-console": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    // code health
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "max-lines-per-function": ["error", { max: 50, skipComments: true, skipBlankLines: true }],
    "max-lines": ["error", { max: 250, skipComments: true, skipBlankLines: true }],
    // imports
    "import/order": ["error", { "newlines-between": "always", alphabetize: { order: "asc" } }]
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/tests/**", "**/e2e/**"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "max-lines-per-function": "off",
        "max-lines": "off"
      }
    },
    {
      files: ["scripts/**", "infra/**"],
      rules: { "no-console": "off" }
    }
  ],
  ignorePatterns: ["dist/**", "node_modules/**", "**/*.js", "**/*.cjs", "**/*.d.ts", "scripts/**", "**/playwright.config.*", "**/vitest.config.*", "apps/frontend/**"]
};
