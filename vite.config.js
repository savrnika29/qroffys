import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const PORT = 5173;
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: PORT,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    allowedHosts: ['a0b8bb2f9dda.ngrok-free.app'], // ✅ Add your ngrok domain here
  },
  preview: {
    host: '0.0.0.0',
    port: PORT,
  },
});