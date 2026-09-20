import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"

// In dev the API runs on plain http://localhost:4000 and Socket.IO on ws://localhost:4000,
// so permit those. Production stays locked to https:/wss: only.
const connectSrc = isDev
  ? "connect-src 'self' https: wss: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*"
  : "connect-src 'self' https: wss:"

// upgrade-insecure-requests would rewrite http://localhost API calls to https and break
// local dev, so only send it in production.
const upgradeDirective = isDev ? "" : " upgrade-insecure-requests;"

const contentSecurityPolicy = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' data: https: blob:; ${connectSrc}; media-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';${upgradeDirective}`

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ]
  },
}

export default nextConfig
