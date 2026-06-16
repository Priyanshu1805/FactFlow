// Triggering Next.js dev server restart to clear compilation cache
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "28ed3beb92e94308-47-11-19-61.serveousercontent.com",
    "*.serveousercontent.com",
    "*.loca.lt",
    "*.pinggy.link",
    "*.lhr.life"
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "date-fns",
      "sonner",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        // X-Frame-Options REMOVED — it was blocking YouTube/external iframes on our own pages
        // Instead use CSP frame-src to allow YouTube embeds
        { key: "Content-Security-Policy", value: "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.youtube.com/embed/ https://www.youtube-nocookie.com/embed/;" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
      ],
    },
  ],
}

export default nextConfig
