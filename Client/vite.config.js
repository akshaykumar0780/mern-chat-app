import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Increase the chunk size warning limit
    chunkSizeWarningLimit: 1000,  // Set this to a higher value to prevent warnings
    // Optional: Split the code into smaller chunks for more efficient loading
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';  // Separate vendor code into its own chunk
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',  // Allow external connections (important for Render)
    port: process.env.PORT || 3000,  // Use the port specified by Render or default to 3000
  },
});
