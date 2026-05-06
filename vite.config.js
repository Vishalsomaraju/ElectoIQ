import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ElectoIQ',
        short_name: 'ElectoIQ',
        description: 'Voter education platform',
        theme_color: '#1a56db',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      // 'credentialless' allows cross-origin resources that don't carry credentials
      // (e.g. Firebase performance/logging) without blocking them as 'require-corp' would.
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Content-Security-Policy': [
        "default-src 'self'",
        // Allow inline scripts (Vite HMR) and eval (Vite dev transforms),
        // reCAPTCHA, Google APIs, and Google Tag Manager (for Firebase Analytics)
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://apis.google.com https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https:",
        "font-src 'self' data: https://fonts.gstatic.com",
        // Extend connect-src to cover Firebase logging and GTM measurement endpoints
        "connect-src 'self' https://generativelanguage.googleapis.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://firebaselogging-pa.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com",
        "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('@google/generative-ai')) return 'gemini'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor'
          }
        },
      },
    },
  },
  envPrefix: 'VITE_',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        functions: 80,
        lines: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
})
