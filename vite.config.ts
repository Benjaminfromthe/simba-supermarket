import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Firebase (largest dependency)
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            // Animation + UI libs
            'vendor-ui': ['framer-motion', 'motion', 'lucide-react'],
            // i18n
            'vendor-i18n': ['i18next', 'react-i18next'],
            // State + toast
            'vendor-misc': ['zustand', 'react-hot-toast'],
          },
        },
      },
    },
  };
});
