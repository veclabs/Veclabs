import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VecLabsInspector',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'inspector.esm.js' : 'inspector.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
