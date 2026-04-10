import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'www',
    emptyOutDir: true
  },
  // Copier les fichiers PWA à la racine du build
  publicDir: 'public'
});
