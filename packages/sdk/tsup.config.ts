import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react-query': 'src/react-query.ts',
    'contracts/validation': 'src/contracts/validation.ts',
    'contracts/format-validators': 'src/contracts/format-validators.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['@tanstack/react-query'],
  onSuccess: 'npm run type-check'
});
