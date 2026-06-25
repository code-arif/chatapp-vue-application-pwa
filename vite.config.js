import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            // Service worker strategy
            strategies: 'generateSW',
            // Include static assets
            includeAssets: [
                'favicon.svg',
                'apple-touch-icon.png',
                'pwa-192x192.png',
                'pwa-512x512.png',
            ],
            // Use our custom manifest.json from /public
            manifest: false,
            // Workbox config
            workbox: {
                // Cache these file types
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
                // Don't cache API calls - always fresh
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api/],
                runtimeCaching: [
                    // Cache Google Fonts
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets',
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                        },
                    },
                    // Cache UI avatars (generated avatars)
                    {
                        urlPattern: /^https:\/\/ui-avatars\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'avatars-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                            },
                        },
                    },
                ],
                // Skip waiting so new SW activates immediately
                skipWaiting: true,
                clientsClaim: true,
            },
            // Dev options - enable SW in dev too for testing
            devOptions: {
                enabled: false, // set true to test PWA in dev mode
                type: 'module',
            },
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
