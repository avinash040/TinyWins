import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Serve from the repo root on GitHub Pages project site
  base: '/TinyWins/',
});
