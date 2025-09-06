import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Serve from the user site root
  base: 'https://avinash040.github.io/',
});
