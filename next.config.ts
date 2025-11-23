import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1:3000",
    "localhost:3000",
    "192.168.2.36:3000",
    "192.168.2.36",
    "37.27.181.216:3000",
    "37.27.181.216",
    "http://37.27.181.216",
    "http://37.27.181.216:3000",
    "http://192.168.2.36",
    "http://192.168.2.36:3000",
    "https://NextRock.saashq.org",
  ],

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      handlebars: "handlebars/dist/cjs/handlebars",
    };

    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Optimize compilation
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  redirects: async () => {
    return [
      {
        source: "/buy-now",
        destination: "/pricing",
        permanent: true,
      },
    ];
  },

  turbopack: {
    resolveAlias: {
      handlebars: "handlebars/dist/cjs/handlebars",
    },
  },

  // Ensure server-only modules are not bundled for client
  serverExternalPackages: ["redis", "@redis/client", "cachified-redis-adapter", "@prisma/client", "bcryptjs", "handlebars", "nodemailer", "postmark"],
};

export default nextConfig;
