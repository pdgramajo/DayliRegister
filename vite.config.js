import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/DayliRegister/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'DayliRegister',
        short_name: 'DayliRegister',
        description: 'POS y gestión de efectivo para pequeños negocios',
        theme_color: '#f8f9fa',
        background_color: '#f8f9fa',
        display: 'standalone',
        lang: 'es',
        scope: '/DayliRegister/',
        start_url: '/DayliRegister/',
        icons: [
          {
            src: '/DayliRegister/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/DayliRegister/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
  test: {
    globals: true,
    setupFiles: './src/setupTests.ts',
    environment: 'jsdom',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/__tests__/**', 'src/**/*.d.ts'],
    },
  },
})
