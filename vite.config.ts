import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Supabase + PostHog roughly doubled the bundle size when added
        // as normal imports (2026-08-23) — splitting them into their own
        // chunk means the browser caches them separately from app code
        // that changes far more often, and a future move to lazy-loading
        // auth/analytics (not done yet) would have a clean chunk
        // boundary to build on.
        manualChunks: {
          vendor_backend: ['@supabase/supabase-js', 'posthog-js'],
        },
      },
    },
  },
})
