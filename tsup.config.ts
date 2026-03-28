import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  clean: true,
  minify: true,
  external: ['react', 'react-dom', 'tailwindcss'],
  outDir: 'dist',
  shims: true,
  target: 'es2019',
});
