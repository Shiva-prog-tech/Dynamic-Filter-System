import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Split the heavy date-picker stack into its own chunk for better caching.
    // (Kept one-directional: date-pickers depend on MUI, not vice-versa, so no
    // circular chunks. React + MUI + Emotion stay together in `vendor`.)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@mui/x-date-pickers') || id.includes('date-fns')) {
            return 'datepickers';
          }
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
