/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development
  reactStrictMode: true,

  // Use Turbopack in development
  experimental: {
    turbo: {
      loaders: {
        // Add loaders for specific file types if needed
        '.svg': ['@svgr/webpack'],
      },
    },
  },

  // Optimize images
  images: {
    domains: ['your-image-domain.com'], // Add image domains
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Path aliases
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': './src/components',
      '@hooks': './src/hooks',
      '@utils': './src/utils',
      '@styles': './src/styles',
      '@types': './src/types',
      '@services': './src/services',
    }
    return config
  },

  // API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/:path*`, // Proxy to backend
      },
    ]
  },

  // Static page generation settings
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // ISR configuration
  staticPageGenerationTimeout: 120, // Increase timeout for larger builds

  // Build optimizations
  swcMinify: true, // Use SWC for minification
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console in prod
  },

  // Enable compression
  compress: true,

  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Customize the build output
  output: 'standalone',

  // Configure redirects if needed
  async redirects() {
    return []
  },

  // Configure trailing slashes
  trailingSlash: false,

  // Configure powered by header
  poweredByHeader: false,
}

module.exports = nextConfig