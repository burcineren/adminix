import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/index.css'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react', 'react-dom', 'tailwindcss'],
  outDir: 'dist',
  shims: true,
  target: 'es2019',
});
