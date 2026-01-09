import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: [process.env.NEXT_PUBLIC_HOST!],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
    ],
  },

  rewrites: async () => {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/manifest",
      },
      {
        source: "/((?!api/|_next/).*)",
        destination: "/shell",
      },
    ]
  },
}

export default nextConfig
