import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false,
    clean: true,
    minify: true,
    external: [
      'react',
      'react-dom',
      'tailwindcss',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'lucide-react',
      'zustand'
    ],
    outDir: 'dist',
    shims: true,
    target: 'es2019',
    injectStyle: true,
  },
  {
    entry: {
      cli: 'src/cli/index.ts',
    },
    format: ['cjs'],
    minify: true,
    clean: false, // Don't clean because the library entry is already cleaning
    outDir: 'dist',
    banner: {
      js: '#!/usr/bin/env node',
    },
    target: 'node16',
    shims: true,
  }
]);
