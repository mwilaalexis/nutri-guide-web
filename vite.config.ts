import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { ProxyOptions } from 'vite'

/** Rewrite gateway redirects that point at 127.0.0.1 (cert hostname mismatch in browser). */
function gatewayProxyOptions(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    secure: false,
    configure(proxy) {
      proxy.on('proxyRes', (proxyRes) => {
        const code = proxyRes.statusCode ?? 0
        if (code < 300 || code >= 400 || !proxyRes.headers.location) return
        const loc = String(proxyRes.headers.location)
        if (loc.includes('127.0.0.1')) {
          proxyRes.headers.location = loc.replace(/127\.0\.0\.1/g, 'localhost')
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gateway =
    env.VITE_GATEWAY_URL?.replace(/\/$/, '') || 'https://localhost:7059'

  const gatewayProxy = gatewayProxyOptions(gateway)

  const microProxy = {
    changeOrigin: true,
    secure: false,
  } as const

  /** When "true", all /api/* goes to the gateway only (Ocelot routes to microservices). */
  const gatewayOnly =
    env.VITE_GATEWAY_ONLY === '1' || env.VITE_GATEWAY_ONLY?.toLowerCase() === 'true'

  const notificationsTarget =
    env.VITE_DEV_NOTIFICATIONS_ORIGIN?.replace(/\/$/, '').trim() || 'https://localhost:7072'
  const trackingTarget =
    env.VITE_DEV_TRACKING_ORIGIN?.replace(/\/$/, '').trim() || 'https://localhost:7073'

  const proxy: Record<string, ProxyOptions> = {}

  if (!gatewayOnly) {
    proxy['/api/notifications'] = { ...microProxy, target: notificationsTarget }
    proxy['/api/tracking'] = { ...microProxy, target: trackingTarget }
  }

  /** Legacy paths from API/static middleware (/images/foods → gateway /foods/images). */
  const imagesProxy: ProxyOptions = {
    ...gatewayProxy,
    rewrite: (path) => {
      if (path.startsWith('/images/foods/')) {
        return path.replace('/images/foods/', '/foods/images/')
      }
      if (path.startsWith('/images/ingredients/')) {
        return path.replace('/images/ingredients/', '/foods/ingredients/')
      }
      return path
    },
  }

  Object.assign(proxy, {
    '/api': gatewayProxy,
    '/images': imagesProxy,
    '/foods': gatewayProxy,
    '/profile-images': gatewayProxy,
  })

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: 'localhost',
      port: 5174,
      strictPort: false,
      proxy,
    },
    preview: {
      host: 'localhost',
      port: 5174,
      proxy,
    },
  }
})
