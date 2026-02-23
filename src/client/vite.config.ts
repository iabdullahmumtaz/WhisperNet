import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = process.env.VITE_API_URL || 'http://localhost:6011';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5011,
    proxy: {
      '/api': api,
      '/uploads': api,
      '/socket.io': { target: api, ws: true },
    },
  },
});
