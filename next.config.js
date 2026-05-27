/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Stub out browser-only modules so they don't execute server-side
      const { IgnorePlugin } = require('webpack')
      config.plugins.push(
        new IgnorePlugin({
          resourceRegExp: /^html2canvas(-pro)?$/,
        })
      )
      // Also treat jspdf + jspdf-autotable as CJS externals (they're only used client-side)
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals].filter(Boolean)
      }
      config.externals.push(({ request }, callback) => {
        if (['jspdf', 'jspdf-autotable', 'html2canvas'].includes(request)) {
          return callback(null, 'commonjs ' + request)
        }
        callback()
      })
    }
    return config
  },
}

module.exports = nextConfig
