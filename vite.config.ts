import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          cleanupOutdatedCaches: true, // delete old chunk caches on update
          globPatterns: ['**/*.{js,css,html,ico,svg}'],
          // Cache product images from Cloudinary (up to 200, 30 days)
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cloudinary-images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts' },
            },
          ],
        },
        manifest: {
          name: 'Simba Supermarket',
          short_name: 'Simba',
          description: "Rwanda's #1 Supermarket — Order online, pick up fast",
          theme_color: '#F47A3E',
          background_color: '#FAFAFA',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/simba-logo.jpg', sizes: '192x192', type: 'image/jpeg' },
            { src: '/simba-logo.jpg', sizes: '512x512', type: 'image/jpeg' },
          ],
        },
      }),
    ],
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
      chunkSizeWarningLimit: 1400,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-ui':       ['framer-motion', 'motion', 'lucide-react'],
            'vendor-i18n':     ['i18next', 'react-i18next'],
            'vendor-misc':     ['zustand', 'react-hot-toast'],
          },
        },
      },
    },
  };
});
